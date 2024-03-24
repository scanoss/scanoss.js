import { Decompressor } from './Decompressor';
export declare class DecompressZip extends Decompressor {
    constructor();
    run(archivePath: string, destPath: string): Promise<void>;
}
