import { ComponentDataLayer, DataProvider, IDataLayers } from '../DataLayerTypes';
import {
  ScannerRawComponent,
  ScannerResults
} from '../../scanner/ScannerTypes';

export class ComponentDataProvider implements DataProvider {

  private scanRawResults: ScannerResults

  private componentList: Array<ScannerRawComponent>;

  constructor(scanRawResults: ScannerResults) {
    this.scanRawResults=scanRawResults;
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public getData(): IDataLayers {
    if (!this.scanRawResults) return {} as IDataLayers;

    //Extract all components from scanRawResults, does not matter if there are duplicated
    this.componentList = Object.values(this.scanRawResults).flat();
    return { component:  this.getComponentDataLayer(this.componentList)} as IDataLayers;
  }


  private getComponentDataLayer(scanComponents: Array<ScannerRawComponent>): Array<ComponentDataLayer> {
    const componentLayer: Array<ComponentDataLayer> = [];

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
            newComponent.versions[0].copyrights.forEach(copyright => {
              if (!versionTarget.copyrights.includes(copyright)) versionTarget.copyrights.push(copyright);
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
    return componentLayer;
  }

}

