export interface CryptoLibraries {
    "id": string;
    "name": string;
    "description": string;
    "keywords": Array<string>;
    "url"?: string;
    "category": string;
    "purl"?: string;
    "tags": Array<string>;
}

export interface ExportControlJob{
    filePath: string;
    cryptoLibraries: Array<CryptoLibraries>;
}

export interface ExportControlResult {
    filePath: string;
    hints: any
}