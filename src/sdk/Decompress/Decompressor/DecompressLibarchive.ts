import fs from 'fs';
import path from 'path';
import { Decompressor } from './Decompressor';

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

  /**
   * Extracts the given archive into destPath using libarchive.js.
   */
  public async run(archivePath: string, destPath: string): Promise<void> {
    const Archive = await getArchive();
    const buffer = fs.readFileSync(archivePath);
    const blob = new Blob([buffer]);
    const archive = await Archive.open(blob);
    try {
      const filesObject = await archive.extractFiles();
      await this.writeExtractedFiles(filesObject, destPath);
    } finally {
      await archive.close();
    }
  }

  /**
   * Recursively writes the nested file object returned by libarchive.js extractFiles()
   * to the filesystem. File entries are written as files, object entries as directories.
   */
  private async writeExtractedFiles(obj: any, destPath: string): Promise<void> {
    const realDest = fs.realpathSync(destPath);
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const fullPath = path.resolve(destPath, key);
      if (!fullPath.startsWith(realDest + path.sep) && fullPath !== realDest) {
        continue;
      }
      if (value instanceof Blob) {
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
