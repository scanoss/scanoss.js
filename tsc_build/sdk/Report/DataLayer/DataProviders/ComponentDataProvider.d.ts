import { DataProvider, IDataLayers } from '../DataLayerTypes';
import { ScannerResults } from '../../../scanner/ScannerTypes';
import { IDependencyResponse } from '../../../Dependencies/DependencyTypes';
export declare class ComponentDataProvider implements DataProvider {
    private scanRawResults;
    private componentList;
    private dependencies;
    constructor(scanRawResults: ScannerResults, dependencies?: IDependencyResponse);
    getLayerName(): string;
    getData(): Promise<IDataLayers>;
    private parseComponentsFromDependencies;
    private parseComponentsFromScanner;
}
