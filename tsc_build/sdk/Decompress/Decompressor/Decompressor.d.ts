export declare abstract class Decompressor {
    protected supportedFormats: Array<string>;
    abstract run(archivePath: string, destPath: string): Promise<void>;
    isSupported(filename: string): boolean;
    /**
     * Returns the extension supported by this decompressor
     * Includes the '.' appended
     */
    getSupportedFormats(): Array<string>;
}
