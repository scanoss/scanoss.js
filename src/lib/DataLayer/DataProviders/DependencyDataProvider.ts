import {DataProvider, IDataLayers, DependencyDataLayer} from '../DataLayerTypes';
import { IDependencyResponse } from '../../dependencies/DependencyTypes';

export class DependencyDataProvider implements DataProvider {

  private dependencies: IDependencyResponse
  public getData(): IDataLayers {
    return {dependencies: this.getDependencyLayer()} as IDataLayers
  }

  public getDependencyLayer(): DependencyDataLayer[]{

    return {} as DependencyDataLayer[]
  }
}
