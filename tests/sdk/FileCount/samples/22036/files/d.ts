// import {
//   DataProvider,
//   IDataLayers,
//   DependencyDataLayer,
//   License, Dependency
// } from '../DataLayerTypes';
// import { IDependencyResponse } from '../../Dependencies/DependencyTypes';
//
// export class DependencyDataProvider implements DataProvider {
//
//   private dependencies: IDependencyResponse;
//
//   constructor(dependencies: IDependencyResponse) {
//     this.dependencies = dependencies;
//   }
//
//   public getLayerName(): string {
//     return this.constructor.name;
//   }
//
//   public getData(): IDataLayers {
//     const dependencyLayer = <IDataLayers>{dependencies: null};
//     if(!this.dependencies) return dependencyLayer;
//     const parsedDepLayer = this.parseDependencyData(this.dependencies);
//     dependencyLayer.dependencies = parsedDepLayer;
//     if (!dependencyLayer.dependencies.length) dependencyLayer.dependencies=null;
//
//     return dependencyLayer;
//   }
//
//   public parseDependencyData(dependencies: IDependencyResponse): DependencyDataLayer[]{
//     const dependencyLayer: Array<DependencyDataLayer> = [];
//
//     dependencies.filesList.forEach(file => {
//       const newDependencies: Array<Dependency> = [];
//       file.dependenciesList.forEach(dependency => {
//         const newLicenses: Array<License> = [];
//         dependency.licensesList.forEach((license) => {
//           newLicenses.push({name: license.name, spdxid: license.spdxId});
//         });
//         newDependencies.push({purl: dependency.purl, licenses: newLicenses, version: dependency.version, component: dependency.component});
//       });
//       dependencyLayer.push({file: file.file, dependencies: newDependencies});
//     });
//
//     return dependencyLayer;
//   }
// }
