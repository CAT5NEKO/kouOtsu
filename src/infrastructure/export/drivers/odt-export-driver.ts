import JSZip from 'jszip';
import type { ExportContent, ExportDriver } from '../../../shared/types/export';

const escapeXml = (input: string): string => input
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\"/g, '&quot;')
  .replace(/'/g, '&apos;');

export class OdtExportDriver implements ExportDriver {
  public async export(content: ExportContent): Promise<Blob> {
    const zip = new JSZip();

    zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });

    const paragraphs = content.textContent
      .split(/\r?\n/)
      .map((line) => `<text:p>${line.length > 0 ? escapeXml(line) : ''}</text:p>`)
      .join('');

    const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  office:version="1.2">
  <office:body>
    <office:text>
      ${paragraphs}
    </office:text>
  </office:body>
</office:document-content>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  office:version="1.2">
  <office:styles/>
</office:document-styles>`;

    const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
  office:version="1.2">
  <office:meta>
    <meta:generator>kouOtsu</meta:generator>
  </office:meta>
</office:document-meta>`;

    const settingsXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-settings
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  office:version="1.2">
  <office:settings/>
</office:document-settings>`;

    const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest
  xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"
  manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="settings.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

    zip.file('content.xml', contentXml);
    zip.file('styles.xml', stylesXml);
    zip.file('meta.xml', metaXml);
    zip.file('settings.xml', settingsXml);
    zip.folder('META-INF')?.file('manifest.xml', manifestXml);

    return zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.oasis.opendocument.text',
    });
  }

  public getFileExtension(): string {
    return 'odt';
  }
}
