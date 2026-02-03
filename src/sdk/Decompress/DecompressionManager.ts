import path from 'path';
import fs from 'fs';
import { Tree } from '../tree/Tree';
import { DecompressionFilter } from '../tree/Filters/DecompressionFilter';
import { Decompressor } from './Decompressor/Decompressor';
import { DecompressZip } from './Decompressor/DecompressZips';
import { DecompressTgz } from './Decompressor/DecompressTgz';
import { DecompressLibarchive } from './Decompressor/DecompressLibarchive';
import { DecompressGz } from './Decompressor/DecompressGz';

export class DecompressionManager {

  private decompressorList: Array<Decompressor>

  private decompressionLevel: number;

  private suffix: string;

  private decompressOverride: boolean;  //When true: Decompress files into <zip_name>-<suffix> whether folder exist or not
                                        //When false: Decompress files into <zip_name>-<suffix>-X where X can be any number until find a free folder name

  constructor(decompressionLevel: number = 1, suffix: string = "-unzipped", decompressOverride: boolean = false) {
    this.decompressionLevel = decompressionLevel;
    this.decompressOverride = decompressOverride;
    this.suffix = suffix;
    this.decompressorList = [
      new DecompressTgz(),
      new DecompressZip(),
      new DecompressLibarchive(),
      new DecompressGz()
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

  public async decompress(archivesPaths: Array<string>): Promise<{ parentFolders: Array<string>, failedFiles: Array<{ path: string, error: string }> }> {
    const failedFiles: Array<{ path: string, error: string }> = [];
    for (const archivePath of archivesPaths) {
      const failed = await this.decompressRecursive(archivePath, 0);
      failedFiles.push(...failed);
    }
    const parentFolders = archivesPaths.map(archivePath => `${archivePath}${this.suffix}`);
    return { parentFolders, failedFiles };
  }


  public async decompressRecursive(archivePath: string, level: number): Promise<Array<{ path: string, error: string }>> {
    const failedFiles: Array<{ path: string, error: string }> = [];

    if(level>=this.decompressionLevel) return failedFiles;

    const archiveRootPath = path.dirname(archivePath);
    const archiveName = path.basename(archivePath);
    let newFolderPath = `${archiveRootPath}${path.sep}${archiveName}${this.suffix}`;

    const isSupported = this.decompressorList.some((d) => d.isSupported(archiveName))
    if(isSupported) {


      let i = 0;
      const r = new RegExp("(?<=" + this.suffix +")-\\d+$")  //Selects last -X where X is a number
      while( !this.decompressOverride && fs.existsSync(newFolderPath) ) { //Search for a free name
        newFolderPath = newFolderPath.replace(r, "");
        newFolderPath += `-${i}`
        i++;
      }

      await fs.promises.mkdir(newFolderPath, { recursive: true });
      //Search for decompressor and extract archive
      let extractionFailed = false;
      for (const d of this.decompressorList) {
        if (d.isSupported(archiveName)) {
          try{
            await d.run(archivePath, newFolderPath);
          } catch(e) {
            await fs.promises.rm(newFolderPath, {recursive: true, force: true});
            const message = e instanceof Error ? e.message : String(e);
            failedFiles.push({ path: archivePath, error: message });
            extractionFailed = true;
          }
          break;
        }
      }

      //Search for new archives (only if extraction succeeded)
      if (!extractionFailed) {
        const tree = new Tree(newFolderPath);
        tree.build()
        const newFilesPath = tree.getFileList(new DecompressionFilter(""));
        for (const newFilePath of newFilesPath) {
          const nestedFailed = await this.decompressRecursive(newFilePath, level+1);
          failedFiles.push(...nestedFailed);
        }
      }
    }

    return failedFiles;
  }

}
