export abstract class Decompressor {
  protected supportedFormats: Array<string>;

  public abstract async run(archivePath: string, destPath: string): Promise<void>;

  public isSupported(filename: string) {
    if (this.supportedFormats.some((format) => filename.endsWith(format))) return true;
    return false;
  }


  /**
   * Returns the extension supported by this decompressor
   * Includes the '.' appended
   */
  public getSupportedFormats(): Array<string> {
    return this.supportedFormats;
  }

}
