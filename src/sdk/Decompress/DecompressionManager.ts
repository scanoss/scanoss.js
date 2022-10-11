import AdmZip from "adm-zip";
import path from 'path';
import fs from 'fs';
import { Tree } from '../tree/Tree';
import { DecompressionFilter } from '../tree/Filters/DecompressionFilter';

type DecompressorFuncType = (destPath: string, srcPath: string) => void;

export class DecompressionManager {
  private decompressorsCollection: Record<string, DecompressorFuncType>;

  private decompressionLevel: number;

  private suffix: string;

  private removeFolderOnFailure: boolean;

  constructor(decompressionLevel: number = 1, suffix: string = "-unzipped", removeFolderOnFailure: boolean = false) {
    this.decompressionLevel = decompressionLevel;
    this.removeFolderOnFailure = removeFolderOnFailure;
    this.suffix = suffix;

    //Maps each file extention with its function that extracts the archive.
    this.decompressorsCollection = {
      ".zip": UncompressAdmZip,
      ".jar": UncompressAdmZip,
      //".tar":
      //".tar.gz":
      //"tgz":
      //"ear":
      //"war":
    };

  }

  public async decompress(archivesPaths: Array<string>): Promise<void> {
    for (const archivePath of archivesPaths) this.decompressRecursive(archivePath, 0);
  }

  public async decompressRecursive(inputPath: string, level: number): Promise<void> {
    if(level>=this.decompressionLevel) return

    const archiveRootPath = path.dirname(inputPath);
    const archiveName = path.basename(inputPath);
    const archiveExtension = path.extname(inputPath);
    const newFolderPath = `${archiveRootPath}${path.sep}${archiveName}${this.suffix}`;

    const isSupported = !!this.decompressorsCollection[archiveExtension];
    if(isSupported) {
      await fs.promises.mkdir(newFolderPath, { recursive: true });
      await this.decompressorsCollection[archiveExtension](newFolderPath, inputPath);

      //Search for new archives
      const tree = new Tree(newFolderPath);
      tree.build()
      const newFilesPath = tree.getFileList(new DecompressionFilter(""));
      for (const newFilePath of newFilesPath) {
        await this.decompressRecursive(newFilePath, level+1);
      }
    }
  }

  public getSupportedFormats(): Array<string> {
    return Object.keys(this.decompressorsCollection);
  }

}

function UncompressAdmZip(destPath: string, srcPath: string) {
  const zip = new AdmZip(srcPath);
  zip.extractAllTo(destPath);
}

