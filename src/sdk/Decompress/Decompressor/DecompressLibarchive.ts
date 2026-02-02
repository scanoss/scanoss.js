import fs from 'fs';
import path from 'path';
import { Decompressor } from './Decompressor';
import { File as NodeFile } from 'node:buffer';

if (typeof globalThis.File === 'undefined') {
  (globalThis as any).File = NodeFile;
}

let _Archive: any;
async function getArchive() {
  if (!_Archive) {
    const mod = await import('libarchive.js/dist/libarchive-node.mjs');
    _Archive = mod.Archive;
  }
  return _Archive;
}


/**
 * Decompressor for multi-file archive formats supported by libarchive.js (WASM-based).
 * Handles .rar, .rpm, .7z, .tar.bz2, .tar.lzma, .tar.xz, .tbz2, and .txz.
 */
export class DecompressLibarchive extends Decompressor {
  constructor() {
    super();
    this.supportedFormats = [
      '.rar',
      '.rpm',
      '.tar.bz2',
      '.tar.lzma',
      '.tar.xz',
      '.tbz2',
      '.txz',
      '.7z',
    ];
  }

  public async run(archivePath: string, destPath: string): Promise<void> {
    const buffer = fs.readFileSync(archivePath);
    const file = new NodeFile([buffer], path.basename(archivePath));
    const Archive = await getArchive();
    const archive = await Archive.open(file);
    try {
      const filesObject = await archive.extractFiles();
      await this.writeExtractedFiles(filesObject, destPath);
    } finally {
      await archive.close();
    }
  }

  private async writeExtractedFiles(obj: any, destPath: string): Promise<void> {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const fullPath = path.join(destPath, key);
      if (value instanceof File) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        const arrayBuffer = await value.arrayBuffer();
        fs.writeFileSync(fullPath, Buffer.from(arrayBuffer));
      } else if (value !== null && typeof value === 'object') {
        fs.mkdirSync(fullPath, { recursive: true });
        await this.writeExtractedFiles(value, fullPath);
      }
    }
  }
}
