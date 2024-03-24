export interface IDirSummary {
    fileSummary: Map<string, IFileSummary>;
    totalFileSize: number;
}
export interface IFileSummary {
    count: number;
    size: number;
    percentage: number;
}
export declare enum Format {
    RAW = 0,
    CSV = 1
}
export interface FileCountOptions {
    filters?: {
        countHidden: boolean;
    };
    output: Format;
}
