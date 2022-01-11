export class WinnowerResponse {
  private wfpContent: string;

  private engineFlags: number;

  private scanRoot: string;

  constructor(wfpContent, scanRoot = '') {
    this.wfpContent = wfpContent;
    this.scanRoot = scanRoot;
  }

  public isEqual(winnowerResponse) {
    return this.getContent() === winnowerResponse.getContent();
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

  public getFilesWinnowed() {
    const files = [];
    const regExp = new RegExp(/,(\/.*)/g);
    let result;
    // eslint-disable-next-line no-cond-assign
    while ((result = regExp.exec(this.wfpContent))) files.push(this.scanRoot + result[1]);
    return files || '';
  }
}

