export class ScannableItem {
  private contentSource: string;

  private content: Buffer;

  private scanMode: any;

  private fingerprint: any;

  private maxSizeWfp: any;

  constructor(content: Buffer, contentSource: string, scanMode: any, maxSizeWfp: number) {
    this.contentSource = contentSource;
    this.content = content;
    this.scanMode = scanMode;
    this.maxSizeWfp = maxSizeWfp;
  }

  public getContent() {
    return this.content;
  }

  public getContentSource() {
    return this.contentSource;
  }

  public getScanMode() {
    return this.scanMode;
  }

  public getFingerprint() {
    return this.fingerprint;
  }

  public getMaxSizeWfp() {
    return this.maxSizeWfp;
  }


}
