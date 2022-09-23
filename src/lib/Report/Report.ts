import fs from 'fs';
import { DataProviderManager } from '../../sdk/DataLayer/DataProviderManager';
import {
  ComponentDataProvider
} from '../../sdk/DataLayer/DataProviders/ComponentDataProvider';
import {
  DependencyDataProvider
} from '../../sdk/DataLayer/DataProviders/DependencyDataProvider';
import {
  LicenseDataProvider
} from '../../sdk/DataLayer/DataProviders/LicenseDataProvider';
import { IDataLayers } from '../../sdk/DataLayer/DataLayerTypes';

export class Report {

  private rawScannerResults: any;

  private pathScannerResults: string;

  private dataProviderManager: DataProviderManager;

  private dataLayer: IDataLayers;

  constructor(pathScannerResults: string) {
    this.pathScannerResults = pathScannerResults;
    this.dataProviderManager = new DataProviderManager();
    this.dataLayer = null;
  }

  public async init() {
    this.rawScannerResults = JSON.parse(await fs.promises.readFile(this.pathScannerResults, 'utf-8'));

    this.dataProviderManager.addLayer(new ComponentDataProvider(this.rawScannerResults.scanner));
    this.dataProviderManager.addLayer(new DependencyDataProvider(this.rawScannerResults.dependencies));
    this.dataProviderManager.addLayer(new LicenseDataProvider(this.rawScannerResults.scanner, this.rawScannerResults.dependencies));

    this.dataLayer = this.dataProviderManager.generateData();
  }

  public generateHTML(): string {
    //Consume data from this.dataLayer;
    return ""
  }



}
