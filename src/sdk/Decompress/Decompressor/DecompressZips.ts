import path from 'path';
import fs from 'fs';

import { Decompressor } from './Decompressor';
import AdmZip from 'adm-zip';

export class DecompressZip extends Decompressor{

  constructor() {
    super();
    this.supportedFormats = [
      ".zip",
      ".jar",
      ".ear",
      ".war",
      ".mtar"
    ]
  }

  // Extract entries manually to avoid adm-zip's internal fs.chmodSync() call,
  // which fails on Windows UNC paths (\\server\share\...) with ENOENT.
  // See: https://github.com/cthackers/adm-zip/issues/162
  public async run(archivePath: string, destPath: string): Promise<void> {
    const zip = new AdmZip(archivePath);
    const entries = zip.getEntries();
    for (const entry of entries) {
      const entryPath = path.join(destPath, entry.entryName);
      if (entry.isDirectory) {
        fs.mkdirSync(entryPath, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(entryPath), { recursive: true });
        fs.writeFileSync(entryPath, entry.getData());
      }
    }
  }

}
