export class FingerprintPackage {
  private wfpContent: string;

  private scanRoot: string;

  constructor(wfpContent: string, scanRoot = '') {
    this.wfpContent = wfpContent;
    this.scanRoot = scanRoot;
  }

  public isEqual(fingerprintPackage: FingerprintPackage): boolean {
    return this.getContent() === fingerprintPackage.getContent();
  }

  public getContent() {
    return this.wfpContent;
  }

  public getNumberFilesFingerprinted() {
    const match = this.getContent().match(/file=/g);
    if(!match) return 0;
    return match.length;
  }

  public getFilesFingerprinted() {
    const files = [];
    const regExp = new RegExp(/,(\/.*)/g);
    let result;
    // eslint-disable-next-line no-cond-assign
    while ((result = regExp.exec(this.wfpContent))) files.push(this.scanRoot + result[1]);
    return files || '';
  }
}

