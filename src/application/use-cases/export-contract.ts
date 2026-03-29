import type { ExportContent, ExportFormat, ExportedFile } from '../../shared/types/export';
import { ExportDriverFactory } from '../../infrastructure/export/export-driver-factory';

export class ExportContractUseCase {
  constructor(private readonly exportDriverFactory: ExportDriverFactory = new ExportDriverFactory()) {}

  public async execute(format: ExportFormat, content: ExportContent): Promise<ExportedFile> {
    const driver = this.exportDriverFactory.create(format);
    const blob = await driver.export(content);

    return {
      blob,
      extension: driver.getFileExtension(),
    };
  }
}
