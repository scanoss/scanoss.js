import { WinnowingMode } from "../ScannerTypes";


export class ScannableItem {
  private contentSource: string;

  private content: Buffer;

  private winnowingMode: WinnowingMode;

  private fingerprint: any;

  private maxSizeWfp: any;

  private lineOffset: number;

  private isBinary: boolean;

  constructor(content: Buffer, contentSource: string, winnowingMode: any, maxSizeWfp: number, isBinary = false) {
    this.contentSource = contentSource;
    this.content = content;
    this.winnowingMode = winnowingMode;
    this.maxSizeWfp = maxSizeWfp;
    this.lineOffset = 0;
    this.isBinary = isBinary;
  }

  public getContent() {
    return this.content;
  }

  public getContentSource() {
    return this.contentSource;
  }

  public getFingerprint() {
    return this.fingerprint;
  }

  public getWinnowingMode(): WinnowingMode {
    return this.winnowingMode;
  }

  public getMaxSizeWfp() {
    return this.maxSizeWfp;
  }

  public setLineOffset(offset: number) {
    this.lineOffset = offset;
  }

  public getLineOffset(): number {
    return this.lineOffset;
  }
}
