import { ComponentDataLayer, DataProvider, IDataLayers } from '../DataLayerTypes';
import {
  ScannerComponent,
  ScannerResults
} from '../../scanner/ScannerTypes';
import { IDependencyResponse } from '../../Dependencies/DependencyTypes';

export class ComponentDataProvider implements DataProvider {

  private scanRawResults: ScannerResults

  private componentList: Array<ScannerComponent>;

  private dependencies: IDependencyResponse;

  constructor(scanRawResults: ScannerResults, dependencies?: IDependencyResponse) {
    this.scanRawResults=scanRawResults;
    this.dependencies = dependencies;
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public getData(): IDataLayers {
    const componentLayer = <IDataLayers>{component: null};

    if (!this.scanRawResults && !this.dependencies) return componentLayer;


    //Extract all components from scanRawResults, does not matter if there are duplicated
    //And removes all no match results.
    this.componentList = Object.values(this.scanRawResults).flat();
    this.componentList = this.componentList.filter(component => component.id!=='none')
    const scannerComponentLayer = this.parseComponentsFromScanner(this.componentList);
    const dependenciesComponentLayer = this.parseComponentsFromDependencies(this.dependencies);

    componentLayer.component =  [...scannerComponentLayer, ...dependenciesComponentLayer].sort(
      (itemA, itemB) => {
                  if ( itemA.name < itemB.name) return -1;
                  else if( itemA.name > itemB.name) return 1;
                  return 0;
               });

    if(!componentLayer.component.length) componentLayer.component=null;

    return componentLayer

  }

  private parseComponentsFromDependencies(dependencies: IDependencyResponse): Array<ComponentDataLayer> {
    const componentLayer: Array<ComponentDataLayer> = [];
    if (!dependencies) return componentLayer;

    dependencies.filesList.forEach(file => {
      file.dependenciesList.forEach(dependency => {
        const newComponent: ComponentDataLayer = <ComponentDataLayer>{};
        newComponent.key = dependency.purl;
        newComponent.purls = [dependency.purl];
        newComponent.name = dependency.component;
        newComponent.url = null;
        newComponent.vendor = null;
        newComponent.versions = [{
          version: dependency.version,
          licenses: dependency.licensesList.map(license => license.spdxId),
          copyrights: null,
        }];

        const existingComponent = componentLayer.find(component => component.key === newComponent.key);
        if (existingComponent) {
          const existingVersion = existingComponent.versions.find(version => version.version === newComponent.versions[0].version);
          if(!existingVersion) existingComponent.versions.push({
            version : newComponent.versions[0].version,
            licenses: newComponent.versions[0].licenses,
            copyrights: newComponent.versions[0].copyrights,
          });
        } else { //Component does not exist, insert as it is.
          componentLayer.push(newComponent);
        }

      });
    });
    return componentLayer;
  }

  private parseComponentsFromScanner(scanComponents: Array<ScannerComponent>): Array<ComponentDataLayer> {
    const componentLayer: Array<ComponentDataLayer> = [];
    if (!scanComponents) return componentLayer

    for (let i=0 ; i<scanComponents.length ; i++) {

      try {
        //Generates a new component
        const newComponent: ComponentDataLayer = {
          key: scanComponents[i].purl[0],
          purls: scanComponents[i].purl,
          name: scanComponents[i].component,
          url: scanComponents[i].url,
          vendor: scanComponents[i].vendor,
          versions: [{
            version: scanComponents[i].version,
            licenses: scanComponents[i].licenses.map(license => license.name),
            copyrights: scanComponents[i].copyrights,
          }]
        };

        //Removes duplicated licenses
        newComponent.versions[0].licenses = [...new Set(newComponent.versions[0].licenses)]

        //Merge new component in componentList

        const componentTarget = componentLayer.find(component => component.key === newComponent.key);
        if (componentTarget) {
          const versionTarget = componentTarget.versions.find(item => item.version === newComponent.versions[0].version);
          if (versionTarget) {

            //Insert licenses
            newComponent.versions[0].licenses.forEach(licence => {
              if (!versionTarget.licenses.includes(licence)) versionTarget.licenses.push(licence);
            });

            //Insert copyright
            newComponent.versions[0]?.copyrights?.forEach(newCopyright => {
              if (versionTarget.copyrights.every(copyright => newCopyright.name != copyright.name)) {
                versionTarget.copyrights.push(newCopyright);
              }

            });

          } else {
            //newComponent version is not included in the component with same purl key
            componentTarget.versions = componentTarget.versions.concat(newComponent.versions);
          }
        } else componentLayer.push(newComponent);

      } catch (e) {
        console.error(`Problem inserting new component building Component Data Layer - `, e);
      }
    }

    //Replace [] for null in versions
    for (let i=0 ; i<componentLayer.length ; i++) {
      componentLayer[i].versions.forEach(version => {
        if(!version.copyrights.length) version.copyrights = null;
        if(!version.licenses.length) version.licenses = null;
      })
    }

    return componentLayer;

  }

}

