import { Decompressor } from './Decompressor/Decompressor';
export declare class DecompressionManager {
    private decompressorList;
    private decompressionLevel;
    private suffix;
    private decompressOverride;
    constructor(decompressionLevel?: number, suffix?: string, decompressOverride?: boolean);
    addDecompressor(d: Decompressor): void;
    getSupportedFormats(): Array<string>;
    decompress(archivesPaths: Array<string>): Promise<Array<string>>;
    decompressRecursive(archivePath: string, level: number): Promise<void>;
}
