import { Document, Packer, Paragraph, TextRun } from 'docx';
import type { ExportContent, ExportDriver } from '../../../shared/types/export';

export class DocxExportDriver implements ExportDriver {
  public async export(content: ExportContent): Promise<Blob> {
    const lines = content.textContent.split(/\r?\n/);
    const children = lines.length > 0
      ? lines.map((line) => new Paragraph({ children: [new TextRun(line)] }))
      : [new Paragraph('')];

    const document = new Document({
      sections: [{
        children,
      }],
    });

    return Packer.toBlob(document);
  }

  public getFileExtension(): string {
    return 'docx';
  }
}
