import { DataProvider, IDataLayers } from '../DataLayerTypes';
import { ScannerResults } from '../../../scanner/ScannerTypes';
import { IDependencyResponse } from '../../../Dependencies/DependencyTypes';
export declare class LicenseDataProvider implements DataProvider {
    private scanResults;
    private componentList;
    private dependencies;
    private licenseStorage;
    private licenseLayer;
    constructor(scanResults: ScannerResults, dependencies?: IDependencyResponse);
    getLayerName(): string;
    getData(): Promise<IDataLayers>;
    private updateLicenseStorageFromComponentList;
    private updateLicenseStorageFromDependencies;
    private insertComponentIntoLicense;
}
