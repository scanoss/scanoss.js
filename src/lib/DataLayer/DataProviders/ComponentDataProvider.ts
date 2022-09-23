import { ComponentDataLayer, DataProvider, IDataLayers } from '../DataLayerTypes';
import { ScannerRawComponent } from '../../scanner/ScannerTypes';


export class ComponentDataProvider implements DataProvider {

  private scanRawResults: object

  private componentList: Array<ScannerRawComponent>;

  constructor(scanRawResults: object) {
    //Recognize if the object is a valid scan
    this.scanRawResults=scanRawResults;

    //Extract all components and place in componenList
    //Does not matter if there are duplicated
    this.componentList = [];

  }

  public getData(): IDataLayers {
    return { component:  this.getComponentDataLayer()} as IDataLayers;
  }


  public getComponentDataLayer(): ComponentDataLayer[] {
    return [] as ComponentDataLayer[];
  }


  public getComponentData(scanResultsRaw: object): ComponentDataLayer[] {

    const componentList: Array<ComponentDataLayer> = [];

    const scanResults = Object.values(scanResultsRaw).map(comps => comps[0]) as Array<{
      purl: string[];
      vendor: string
      component: string;
      version: string;
      url: string;
      licenses: {name: string}[];
      copyrights: {name: string; source: string;}[]
    }>;

    if (!scanResults || scanResults.length === 0 ) return [];


      // Allocate components in array
      for (let i=0 ; i<scanResults.length; i++) {

        try {
          //Generates a new component
          const newComponent: ComponentDataLayer = {
            key: scanResults[i].purl[0],
            purls: scanResults[i].purl,
            name: scanResults[i].component,
            url: scanResults[i].url,
            vendor: scanResults[i].vendor,
            versions: [{
              version: scanResults[i].version,
              licenses: scanResults[i].licenses.map(license => license.name),
              copyrights: scanResults[i].copyrights,
            }]
          };

          //Removes duplicated licenses
          newComponent.versions[0].licenses = [...new Set(newComponent.versions[0].licenses)]

          //Merge new component in componentList

          const componentTarget = componentList.find(component => component.key === newComponent.key);
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
          } else {
            componentList.push(newComponent);
          }

        } catch (e) {
          console.error(`Problem inserting new component building Component Data Layer - `, e);
        }
      }
      return componentList;

  }

}

