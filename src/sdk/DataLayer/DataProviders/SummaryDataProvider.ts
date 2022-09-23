import {DataProvider, IDataLayers, LicenseDataLayer} from '../DataLayerTypes';
import { ScannerRawComponent } from '../../scanner/ScannerTypes';

//TODO Implement SummarDataProvider
export class SummaryDataProvider implements DataProvider {

  private components: ScannerRawComponent[];

  constructor(components: ScannerRawComponent[]) {
    this.components = components;
  }

  public getData(): IDataLayers {
    return {licenses: this.getLicenseLayer()} as IDataLayers
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public getLicenseLayer(): LicenseDataLayer[]{

    return {} as LicenseDataLayer[]
  }
}
