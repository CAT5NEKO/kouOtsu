import { jsPDF } from 'jspdf';
import type { ExportContent, ExportDriver } from '../../../shared/types/export';

type TextRun = {
  text: string;
  isBold: boolean;
  isPrimary: boolean;
};

type FontSet = {
  regular: string;
  bold: string;
};

let cachedFontBinary: string | null = null;

const FONT_REGULAR_ID = 'NotoSansJP-Regular';
const FONT_BOLD_ID = 'NotoSansJP-Bold';
const FONT_REGULAR_FILE = `${FONT_REGULAR_ID}.ttf`;
const FONT_BOLD_FILE = `${FONT_BOLD_ID}.ttf`;
const LOCAL_FONT_URL = '/fonts/NotoSansJP-wght.ttf';
const PRIMARY_COLOR: [number, number, number] = [59, 130, 246];
const NORMAL_COLOR: [number, number, number] = [31, 41, 55];

const arrayBufferToBinaryString = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return binary;
};

const ensureFonts = async (pdf: jsPDF): Promise<FontSet> => {
  if (!cachedFontBinary) {
    const response = await fetch(LOCAL_FONT_URL);
    if (!response.ok) {
      throw new Error('PDFフォントの読み込みに失敗しました。');
    }
    cachedFontBinary = arrayBufferToBinaryString(await response.arrayBuffer());
  }

  const fontList = pdf.getFontList() as Record<string, unknown>;

  if (!fontList[FONT_REGULAR_ID]) {
    pdf.addFileToVFS(FONT_REGULAR_FILE, cachedFontBinary);
    pdf.addFont(FONT_REGULAR_FILE, FONT_REGULAR_ID, 'normal');
  }

  if (!fontList[FONT_BOLD_ID]) {
    pdf.addFileToVFS(FONT_BOLD_FILE, cachedFontBinary);
    pdf.addFont(FONT_BOLD_FILE, FONT_BOLD_ID, 'normal');
  }

  return {
    regular: FONT_REGULAR_ID,
    bold: FONT_BOLD_ID,
  };
};

const mergeRun = (line: TextRun[], next: TextRun) => {
  if (next.text.length === 0) return;
  const last = line[line.length - 1];
  if (last && last.isBold === next.isBold && last.isPrimary === next.isPrimary) {
    last.text += next.text;
    return;
  }

  line.push(next);
};

const pushWrappedRun = (
  pdf: jsPDF,
  lines: TextRun[][],
  maxWidth: number,
  run: TextRun,
  fonts: FontSet,
) => {
  if (run.text.length === 0) return;

  let line = lines[lines.length - 1];
  const fontName = run.isBold ? fonts.bold : fonts.regular;
  pdf.setFont(fontName, 'normal');

  for (const char of run.text) {
    if (char === '\n') {
      lines.push([]);
      line = lines[lines.length - 1];
      continue;
    }

    const width = pdf.getTextWidth(char);
    const currentWidth = line.reduce((total, item) => {
      const currentFont = item.isBold ? fonts.bold : fonts.regular;
      pdf.setFont(currentFont, 'normal');
      return total + pdf.getTextWidth(item.text);
    }, 0);

    if (currentWidth + width > maxWidth && line.length > 0) {
      lines.push([]);
      line = lines[lines.length - 1];
    }

    mergeRun(line, {
      text: char,
      isBold: run.isBold,
      isPrimary: run.isPrimary,
    });
  }
};

const parseRunsFromHtml = (htmlContent: string): TextRun[] => {
  if (htmlContent.trim().length === 0) {
    return [];
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = htmlContent;
  const runs: TextRun[] = [];

  const walk = (node: Node, style: { isBold: boolean; isPrimary: boolean }) => {
    if (node.nodeType === Node.TEXT_NODE) {
      mergeRun(runs, {
        text: node.textContent ?? '',
        isBold: style.isBold,
        isPrimary: style.isPrimary,
      });
      return;
    }

    if (!(node instanceof HTMLElement)) {
      return;
    }

    if (node.tagName === 'BR') {
      mergeRun(runs, {
        text: '\n',
        isBold: style.isBold,
        isPrimary: style.isPrimary,
      });
      return;
    }

    const classes = node.className;
    const nextStyle = {
      isBold: style.isBold || classes.includes('font-bold'),
      isPrimary: style.isPrimary || classes.includes('text-primary'),
    };

    const blockTags = new Set(['DIV', 'P', 'SECTION', 'ARTICLE', 'LI', 'UL', 'OL']);
    if (blockTags.has(node.tagName)) {
      mergeRun(runs, {
        text: '\n',
        isBold: style.isBold,
        isPrimary: style.isPrimary,
      });
    }

    for (const child of Array.from(node.childNodes)) {
      walk(child, nextStyle);
    }

    if (blockTags.has(node.tagName)) {
      mergeRun(runs, {
        text: '\n',
        isBold: style.isBold,
        isPrimary: style.isPrimary,
      });
    }
  };

  for (const node of Array.from(wrapper.childNodes)) {
    walk(node, { isBold: false, isPrimary: false });
  }

  return runs;
};

const parseRuns = (content: ExportContent): TextRun[] => {
  const htmlRuns = parseRunsFromHtml(content.htmlContent);
  if (htmlRuns.length > 0) {
    return htmlRuns;
  }

  return [{
    text: content.textContent,
    isBold: false,
    isPrimary: false,
  }];
};

export class PdfExportDriver implements ExportDriver {
  public async export(content: ExportContent): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    });

    const fonts = await ensureFonts(pdf);
    const fontSize = 12;
    const lineHeight = 24;
    const marginX = 28;
    const marginY = 32;

    pdf.setFontSize(fontSize);
    pdf.setFont(fonts.regular, 'normal');
    pdf.setTextColor(...NORMAL_COLOR);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - marginX * 2;

    const runs = parseRuns(content);
    const lines: TextRun[][] = [[]];

    for (const run of runs) {
      pushWrappedRun(pdf, lines, maxWidth, run, fonts);
    }

    let y = marginY;

    for (const line of lines) {
      if (y + lineHeight > pageHeight - marginY) {
        pdf.addPage();
        y = marginY;
      }

      let x = marginX;
      for (const run of line) {
        const fontName = run.isBold ? fonts.bold : fonts.regular;
        pdf.setFont(fontName, 'normal');
        if (run.isPrimary) {
          pdf.setTextColor(...PRIMARY_COLOR);
        } else {
          pdf.setTextColor(...NORMAL_COLOR);
        }

        if (run.text.length > 0) {
          pdf.text(run.text, x, y);
          x += pdf.getTextWidth(run.text);
        }
      }

      y += lineHeight;
    }

    return pdf.output('blob');
  }

  public getFileExtension(): string {
    return 'pdf';
  }
}
