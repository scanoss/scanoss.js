import { Decompressor } from './Decompressor';
import fs from 'fs';
import tar from 'tar';

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
    await fs.createReadStream(archivePath)
      .pipe(tar.x({
        C: destPath
      }));
  }

}
