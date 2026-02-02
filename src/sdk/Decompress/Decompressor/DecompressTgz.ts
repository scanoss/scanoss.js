import { Decompressor } from './Decompressor';
import fs from 'fs';
import * as tar from 'tar';

export class DecompressTgz extends Decompressor{

  constructor() {
    super();
    this.supportedFormats = [
      ".tar.gz",
      ".tgz",
      ".tar",
    ]
  }

  public async run(archivePath: string, destPath: string): Promise<void> {
      return tar.x({C: destPath, file: archivePath});
  }

}
