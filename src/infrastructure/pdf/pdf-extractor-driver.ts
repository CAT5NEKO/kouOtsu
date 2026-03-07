import type { PdfExtractorDriver } from '../../shared/types/driver';
import type { PdfExtractResult } from '../../shared/types/contract';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import PDFJsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min?worker';

export class PdfExtractorDriverImpl implements PdfExtractorDriver {
  constructor() {
    pdfjs.GlobalWorkerOptions.workerPort = new PDFJsWorker();
  }

  public async extractText(file: File): Promise<PdfExtractResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', async () => {
        try {
          if (!reader.result) {
            resolve({ text: '' });
            return;
          }

          const pdf = await pdfjs.getDocument({
            data: reader.result,
            cMapUrl: './cmaps/',
            cMapPacked: true,
          }).promise;

          let pdfText = '';

          for (let p = 1; p <= pdf.numPages; p++) {
            const pdfPage = await pdf.getPage(p);
            const pdfContent = await pdfPage.getTextContent();
            
            let lastY: number | null = null;
            let pageText = '';

            for (const item of pdfContent.items) {
              if (!('str' in item)) continue;
              
              const currentY = item.transform[5];
              if (lastY !== null && Math.abs(currentY - lastY) > 5) {
                pageText += '\n';
              }
              
              pageText += item.str;
              lastY = currentY;
            }
            pdfText += pageText + '\n\n';
          }

          resolve({ text: pdfText.trim() });
        } catch (error) {
          reject(error);
        }
      });

      reader.addEventListener('error', (error) => {
        reject(error);
      });

      reader.readAsArrayBuffer(file);
    });
  }
}
