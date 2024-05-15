import { DataProvider, IDataLayers } from './DataLayerTypes';

export class DataProviderManager {
  private dataLayersProviders: Array<DataProvider>;

  constructor() {
    this.dataLayersProviders = [];
  }

  public addDataProvider(l: DataProvider) {
    this.dataLayersProviders.push(l);
  }

  public async generateData(): Promise<IDataLayers> {
    let dataLayer: IDataLayers = {
      component: null,
      dependencies: null,
      vulnerabilities: null,
      summary: null,
      licenses: null,
      licensesObligations: null,
      cryptography: null,
    };

    for (const layer of this.dataLayersProviders)
      Object.assign(dataLayer, await layer.getData());
    return dataLayer;
  }
}
