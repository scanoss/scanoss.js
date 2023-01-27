export interface IDirSummary {
    fileSummary: Map<string,IFileSummary>;
    totalFileSize: number;
}

export interface IFileSummary {
    count: number;
    size: number;
    percentage: number;
}


export enum Format {
    RAW,
    CSV
}
export interface FileCountOptions {
    filters?: {
      countHidden: boolean
    }
    output: Format;
}

