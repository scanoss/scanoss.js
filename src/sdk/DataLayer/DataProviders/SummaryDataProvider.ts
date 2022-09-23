import {DataProvider, IDataLayers, LicenseDataLayer} from '../DataLayerTypes';
import { ScannerRawComponent } from '../../scanner/ScannerTypes';

export class SummaryDataProvider implements DataProvider {

  private components: ScannerRawComponent[];

  constructor(components: ScannerRawComponent[]) {
    this.components = components;
  }

  public getData(): IDataLayers {
    return {licenses: this.getLicenseLayer()} as IDataLayers
  }

  public getLicenseLayer(): LicenseDataLayer[]{

    return {} as LicenseDataLayer[]
  }
}
