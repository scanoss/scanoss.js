import { DataProvider, IDataLayers } from '../DataLayerTypes';
import { ScannerResults } from '../../../scanner/ScannerTypes';
export declare class SummaryDataProvider implements DataProvider {
    private scannerResults;
    private summary;
    private projectName;
    private projectCreateAt;
    private reportTitle;
    constructor(projectName: string, projectCreatedAt: Date, scannerResults: ScannerResults);
    getLayerName(): string;
    getData(): Promise<IDataLayers>;
    getReportTitle(): string;
}
