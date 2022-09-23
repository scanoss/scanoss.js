import {DataProvider, IDataLayers, LicenseDataLayer} from '../DataLayerTypes';
import { ScannerRawComponent } from '../../scanner/ScannerTypes';
import { IDependencyResponse } from '../../Dependencies/DependencyTypes';
import { DependencyDataProvider } from './DependencyDataProvider';

//TODO Implement LicenseDataProvider
export class LicenseDataProvider implements DataProvider {

  private components: ScannerRawComponent[];

  private dependencies: IDependencyResponse;

  constructor(components: ScannerRawComponent[], dependencies: IDependencyResponse ) {
    this.components = components;
    this.dependencies = dependencies;
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public getData(): IDataLayers {
    return {licenses: this.getLicenseLayer()} as IDataLayers
  }

  public getLicenseLayer(): LicenseDataLayer[]{

    return {} as LicenseDataLayer[]
  }
}
