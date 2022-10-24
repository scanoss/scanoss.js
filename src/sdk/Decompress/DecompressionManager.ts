import path from 'path';
import fs from 'fs';
import { Tree } from '../tree/Tree';
import { DecompressionFilter } from '../tree/Filters/DecompressionFilter';
import { Decompressor } from './Decompressor/Decompressor';
import { DecompressZip } from './Decompressor/DecompressZips';
import { DecompressTgz } from './Decompressor/DecompressTgz';

export class DecompressionManager {

  private decompressorList: Array<Decompressor>

  private decompressionLevel: number;

  private suffix: string;

  private removeFolderOnFailure: boolean;

  constructor(decompressionLevel: number = 1, suffix: string = "-unzipped", removeFolderOnFailure: boolean = false) {
    this.decompressionLevel = decompressionLevel;
    this.removeFolderOnFailure = removeFolderOnFailure;
    this.suffix = suffix;

    this.decompressorList = [
      new DecompressTgz(),
      new DecompressZip()
    ];

  }

  public addDecompressor(d: Decompressor) {
    this.decompressorList.push(d);
  }

  public getSupportedFormats(): Array<string> {
    const supportedFormats = [];
    this.decompressorList.forEach((d) => {
      supportedFormats.push(...d.getSupportedFormats())
    });
    return supportedFormats;
  }

  public async decompress(archivesPaths: Array<string>): Promise<Array<string>> {
    for (const archivePath of archivesPaths) await this.decompressRecursive(archivePath, 0);
    const parentFoldersPath = archivesPaths.map(archivePath => `${archivePath}${this.suffix}`);
    return parentFoldersPath;
  }

  public async decompressRecursive(archivePath: string, level: number): Promise<void> {
    if(level>=this.decompressionLevel) return

    const archiveRootPath = path.dirname(archivePath);
    const archiveName = path.basename(archivePath);
    const newFolderPath = `${archiveRootPath}${path.sep}${archiveName}${this.suffix}`;

    const isSupported = this.decompressorList.some((d) => d.isSupported(archiveName))
    if(isSupported) {
      await fs.promises.mkdir(newFolderPath, { recursive: true });

      //Search for decompressor and extract archive
      for (const d of this.decompressorList) {
        if (d.isSupported(archiveName)) {
          await d.run(archivePath, newFolderPath);
          break;
        }
      }


      //Search for new archives
      const tree = new Tree(newFolderPath);
      tree.build()
      const newFilesPath = tree.getFileList(new DecompressionFilter(""));
      for (const newFilePath of newFilesPath) {
        await this.decompressRecursive(newFilePath, level+1);
      }
    }

  }

}
