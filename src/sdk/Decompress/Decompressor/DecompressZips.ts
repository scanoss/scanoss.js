import { Decompressor } from './Decompressor';
import AdmZip from 'adm-zip';

export class DecompressZip extends Decompressor{

  constructor() {
    super();
    this.supportedFormats = [
      ".zip",
      ".jar",
      ".ear",
      ".war"
    ]
  }

  public async run(archivePath: string, destPath: string): Promise<void> {
    const zip = new AdmZip(archivePath);
    zip.extractAllTo(destPath);
  }

}
