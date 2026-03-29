import type { ExportDriver, ExportFormat } from '../../shared/types/export';
import { DocxExportDriver } from './drivers/docx-export-driver';
import { OdtExportDriver } from './drivers/odt-export-driver';
import { PdfExportDriver } from './drivers/pdf-export-driver';
import { TxtExportDriver } from './drivers/txt-export-driver';

export class ExportDriverFactory {
  public create(format: ExportFormat): ExportDriver {
    switch (format) {
      case 'txt':
        return new TxtExportDriver();
      case 'docx':
        return new DocxExportDriver();
      case 'odt':
        return new OdtExportDriver();
      case 'pdf':
        return new PdfExportDriver();
      default:
        return new TxtExportDriver();
    }
  }
}
