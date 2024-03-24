import { FileCountOptions, IDirSummary } from './Interfaces';
export declare class FileCount {
    static walk(rootPath: string, option?: FileCountOptions): Promise<string | IDirSummary>;
    private static exploreBFS;
    private static produceCsv;
}
