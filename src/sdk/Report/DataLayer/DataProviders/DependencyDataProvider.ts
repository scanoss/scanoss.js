import {
  DataProvider,
  IDataLayers,
  DependencyDataLayer,
  License,
  Dependency,
} from '../DataLayerTypes';
import { DependencyResponse } from "../../../Clients/Dependency/IDependencyClient";

export class DependencyDataProvider implements DataProvider {
  private dependencies: DependencyResponse;

  constructor(dependencies: DependencyResponse) {
    this.dependencies = dependencies;
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public async getData(): Promise<IDataLayers> {
    const dependencyLayer = <IDataLayers>{ dependencies: null };
    if (!this.dependencies) return dependencyLayer;
    const parsedDepLayer = this.parseDependencyData(this.dependencies);
    dependencyLayer.dependencies = parsedDepLayer;
    if (!dependencyLayer.dependencies.length)
      dependencyLayer.dependencies = null;

    return dependencyLayer;
  }

  public parseDependencyData(
    dependencies: DependencyResponse
  ): DependencyDataLayer[] {
    const dependencyLayer: Array<DependencyDataLayer> = [];

    dependencies.filesList.forEach((file) => {
      const newDependencies: Array<Dependency> = [];
      file.dependenciesList.forEach((dependency) => {
        const newLicenses: Array<License> = [];
        dependency.licensesList.forEach((license) => {
          newLicenses.push({ name: license.name, spdxid: license.spdxId });
        });
        newDependencies.push({
          purl: dependency.purl,
          licenses: newLicenses,
          version: dependency.version,
          component: dependency.component,
          url: dependency.url
        });
      });
      dependencyLayer.push({ file: file.file, dependencies: newDependencies });
    });

    return dependencyLayer;
  }
}
