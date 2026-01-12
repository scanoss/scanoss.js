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

  private decompressOverride: boolean;  //When true: Decompress files into <zip_name>-<suffix> whether folder exist or not
                                        //When false: Decompress files into <zip_name>-<suffix>-X where X can be any number until find a free folder name

  constructor(decompressionLevel: number = 1, suffix: string = "-unzipped", decompressOverride: boolean = false) {
    this.decompressionLevel = decompressionLevel;
    this.decompressOverride = decompressOverride;
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
      for (const d of this.decompressorList) {
        if (d.isSupported(archiveName)) {
          try{
            await d.run(archivePath, newFolderPath);
          } catch(e) {
            await fs.promises.rm(newFolderPath, {recursive: true, force: true});
            const message = e instanceof Error ? e.message : String(e);
            throw new Error(`${message}\n\nFailed to extract: "${archivePath}"`);
          }
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
