/// <reference types="node" />
import { WinnowingMode } from "../ScannerTypes";
export declare class ScannableItem {
    private contentSource;
    private content;
    private winnowingMode;
    private fingerprint;
    private maxSizeWfp;
    constructor(content: Buffer, contentSource: string, winnowingMode: any, maxSizeWfp: number);
    getContent(): Buffer;
    getContentSource(): string;
    getFingerprint(): any;
    getWinnowingMode(): WinnowingMode;
    getMaxSizeWfp(): any;
}
