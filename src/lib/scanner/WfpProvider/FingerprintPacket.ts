export class FingerprintPacket {
  private wfpContent: string;

  private engineFlags: number;

  private scanRoot: string;

  constructor(wfpContent: string, scanRoot = '') {
    this.wfpContent = wfpContent;
    this.scanRoot = scanRoot;
  }

  public isEqual(fingerprintPacket: FingerprintPacket): boolean {
    return this.getContent() === fingerprintPacket.getContent();
  }

  public getContent() {
    return this.wfpContent;
  }

  public setEngineFlags(engineFlags: number): void {
    this.engineFlags = engineFlags;
  }

  public getEngineFlags(): number {
    return this.engineFlags;
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

