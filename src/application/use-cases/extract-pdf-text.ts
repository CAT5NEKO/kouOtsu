import type { PdfExtractorDriver } from '../../shared/types/driver';
import type { PdfExtractResult } from '../../shared/types/contract';

export class ExtractPdfTextUseCase {
  constructor(private readonly pdfExtractor: PdfExtractorDriver) {}

  public async execute(file: File): Promise<PdfExtractResult> {
    return this.pdfExtractor.extractText(file);
  }
}
