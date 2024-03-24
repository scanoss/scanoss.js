import { Decompressor } from './Decompressor';
export declare class DecompressTgz extends Decompressor {
    constructor();
    run(archivePath: string, destPath: string): Promise<void>;
}
