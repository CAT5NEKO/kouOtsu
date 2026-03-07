import type { PdfExtractResult } from '../types/contract';

export interface PdfExtractorDriver {
  extractText(file: File): Promise<PdfExtractResult>;
}
