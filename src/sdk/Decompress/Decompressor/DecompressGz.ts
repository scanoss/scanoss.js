import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { Decompressor } from './Decompressor';

/**
 * Decompressor for single-file gzip compressed formats (.gz).
 * Uses Node.js built-in zlib for decompression.
 * Output filename is derived by stripping the .gz extension.
 */
export class DecompressGz extends Decompressor {
  constructor() {
    super();
    this.supportedFormats = ['.gz'];
  }

  public async run(archivePath: string, destPath: string): Promise<void> {
    const buffer = fs.readFileSync(archivePath);
    const basename = path.basename(archivePath);
    const outputName = basename.slice(0, basename.lastIndexOf('.'));
    const outputPath = path.join(destPath, outputName);
    const decompressed = zlib.gunzipSync(buffer);
    fs.writeFileSync(outputPath, decompressed);
  }
}
