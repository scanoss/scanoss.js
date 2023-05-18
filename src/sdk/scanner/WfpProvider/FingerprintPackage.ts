import { v4 as uuidv4 } from 'uuid';
import path from 'path';


export class FingerprintPackage {
  private wfpContent: string;

  private scanRoot: string;

  private obfuscateMap :Record<string, string>;

  constructor(wfpContent: string, scanRoot = '') {
    this.wfpContent = wfpContent;
    this.scanRoot = scanRoot;
    this.obfuscateMap = null;
  }

  public isEqual(fingerprintPackage: FingerprintPackage): boolean {
    return this.getContent() === fingerprintPackage.getContent();
  }

  public getContent(): string {
    return this.wfpContent;
  }

  public setContent(wfp) {
    this.wfpContent = wfp;
  }

  public getNumberFilesFingerprinted() {
    const match = this.getContent().match(/file=/g);
    if(!match) return 0;
    return match.length;
  }

  public getFilesFingerprinted(): Array<string> {
    const filePaths = [];
    const regex = new RegExp(/file=.*,.*,(?<filePath>.*)/g);

    let match;
    while ((match = regex.exec(this.getContent())) !== null) {
      if (match.groups) {
        let filePath = match.groups.filePath;
        filePaths.push(filePath);
      }
    }

    return filePaths;
  }

  public isObfuscated() {
    if (!this.obfuscateMap) return false;
    return true;
  }

  public getObfuscationMap(): Record<string, string> {
    return this.obfuscateMap;
  }

  public obfuscate(): Record<string, string> {
    let regex = /(file=.*,.*),(.*)/g;
    this.obfuscateMap = {};

    let output = this.getContent().replace(regex, (_, match, originalPath) => {
      const uuid=uuidv4().replace(/-/g, '');

      const ext = path.extname(originalPath);

      this.obfuscateMap[uuid+ext] = originalPath;
      const newPath = uuid + ext;
      return `${match},${newPath}`
    });

    this.setContent(output);
    return this.obfuscateMap;
  }

}

