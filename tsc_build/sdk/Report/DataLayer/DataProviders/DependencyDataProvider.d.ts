import { DataProvider, IDataLayers, DependencyDataLayer } from '../DataLayerTypes';
import { IDependencyResponse } from '../../../Dependencies/DependencyTypes';
export declare class DependencyDataProvider implements DataProvider {
    private dependencies;
    constructor(dependencies: IDependencyResponse);
    getLayerName(): string;
    getData(): Promise<IDataLayers>;
    parseDependencyData(dependencies: IDependencyResponse): DependencyDataLayer[];
}
