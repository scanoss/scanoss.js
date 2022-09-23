import { DataProvider, IDataLayers } from './types';

export class DataProviderManager {
  private dataLayersProviders: Array<DataProvider>;

  public addLayer(l: DataProvider) {
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

    for (const layer of this.dataLayersProviders) Object.assign(dataLayer, layer.getData())
    return dataLayer;
  }
}
