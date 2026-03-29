import type { ExportContent, ExportDriver } from '../../../shared/types/export';

export class TxtExportDriver implements ExportDriver {
  public async export(content: ExportContent): Promise<Blob> {
    return new Blob([content.textContent], { type: 'text/plain;charset=utf-8' });
  }

  public getFileExtension(): string {
    return 'txt';
  }
}
