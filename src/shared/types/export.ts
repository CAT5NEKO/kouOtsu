export type ExportFormat = 'txt' | 'docx' | 'odt' | 'pdf';

export interface ExportContent {
  htmlContent: string;
  textContent: string;
}

export interface ExportedFile {
  blob: Blob;
  extension: string;
}

export interface ExportDriver {
  export(content: ExportContent): Promise<Blob>;
  getFileExtension(): string;
}
