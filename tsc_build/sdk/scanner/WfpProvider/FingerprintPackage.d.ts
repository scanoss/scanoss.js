export declare class FingerprintPackage {
    private wfpContent;
    private scanRoot;
    private obfuscateMap;
    constructor(wfpContent: string, scanRoot?: string);
    isEqual(fingerprintPackage: FingerprintPackage): boolean;
    getContent(): string;
    setContent(wfp: any): void;
    getNumberFilesFingerprinted(): number;
    getFilesFingerprinted(): Array<string>;
    isObfuscated(): boolean;
    getObfuscationMap(): Record<string, string>;
    obfuscate(): Record<string, string>;
}
