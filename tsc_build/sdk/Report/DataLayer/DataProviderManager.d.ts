import { DataProvider, IDataLayers } from './DataLayerTypes';
export declare class DataProviderManager {
    private dataLayersProviders;
    constructor();
    addDataProvider(l: DataProvider): void;
    generateData(): Promise<IDataLayers>;
}
