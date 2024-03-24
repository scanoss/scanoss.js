import { DataProviderManager } from './DataLayer/DataProviderManager';
export declare class Report {
    private dataProviderManager;
    private dataLayer;
    private report;
    private templatePath;
    private dataPlaceholder;
    constructor(dpm?: DataProviderManager);
    setDataProviderManager(dpm: DataProviderManager): void;
    setTemplatePath(filePath: string): void;
    getTemplatePath(): string;
    getHTML(): Promise<string>;
    saveToFile(fsPath: string): Promise<void>;
}
