import { DataProvider, IDataLayers } from './DataLayerTypes';

export class DataProviderManager {
  private dataLayersProviders: Array<DataProvider>;

  constructor() {
    this.dataLayersProviders = [];
  }

  public addDataProvider(l: DataProvider) {
    this.dataLayersProviders.push(l)
  }

  public generateData(): IDataLayers {

    let dataLayer: IDataLayers = {
      component: null,
      dependencies: null,
      vulnerabilities: null,
      summary: null,
      licenses: null
    };

    for (const layer of this.dataLayersProviders) Object.assign(dataLayer, layer.getData());
    return dataLayer;
  }
}
