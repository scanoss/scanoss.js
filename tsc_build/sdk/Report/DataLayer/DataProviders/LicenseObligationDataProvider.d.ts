import { DataProvider, IDataLayers } from '../DataLayerTypes';
import { ScannerResults } from '../../../scanner/ScannerTypes';
import { IDependencyResponse } from '../../../Dependencies/DependencyTypes';
export declare class LicenseObligationDataProvider implements DataProvider {
    private scanResults;
    private dependencies;
    private licenseLayer;
    private componentList;
    private licenseSet;
    constructor(scanResults: ScannerResults, dependencies?: IDependencyResponse);
    getLayerName(): string;
    getData(): Promise<IDataLayers>;
}
