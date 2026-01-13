import {
  ComponentDataLayer,
  DataProvider,
  Health,
  IDataLayers,
} from '../DataLayerTypes';
import {
  ScannerComponent,
  ScannerResults,
} from '../../../scanner/ScannerTypes';
import { IDependencyResponse } from '../../../Dependencies/DependencyTypes';
import { DependencyResponse } from "../../../Clients/Dependency/IDependencyClient";

export class ComponentDataProvider implements DataProvider {
  private scanRawResults: ScannerResults;

  private componentList: Array<ScannerComponent>;

  private dependencies: DependencyResponse;

  constructor(
    scanRawResults: ScannerResults,
    dependencies?: DependencyResponse
  ) {
    this.scanRawResults = scanRawResults;
    this.dependencies = dependencies;
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public async getData(): Promise<IDataLayers> {
    const componentLayer = <IDataLayers>{ component: null };

    if (!this.scanRawResults && !this.dependencies) return componentLayer;

    //Extract all components from scanRawResults, does not matter if there are duplicated
    //And removes all no match results.
    this.componentList = Object.values(this.scanRawResults).flat();
    this.componentList = this.componentList.filter(
      (component) => component.id !== 'none'
    );
    const scannerComponentLayer = this.parseComponentsFromScanner(
      this.componentList
    );
    const dependenciesComponentLayer = this.parseComponentsFromDependencies(
      this.dependencies
    );

    componentLayer.component = [
      ...scannerComponentLayer,
      ...dependenciesComponentLayer,
    ].sort((itemA, itemB) => {
      if (itemA.name < itemB.name) return -1;
      else if (itemA.name > itemB.name) return 1;
      return 0;
    });

    if (!componentLayer.component.length) componentLayer.component = null;

    return componentLayer;
  }

  private parseComponentsFromDependencies(
    dependencies: DependencyResponse
  ): Array<ComponentDataLayer> {
    const componentLayer: Array<ComponentDataLayer> = [];
    return componentLayer;
  }

  private parseComponentsFromScanner(
    scanComponents: Array<ScannerComponent>
  ): Array<ComponentDataLayer> {
    const componentLayer: Array<ComponentDataLayer> = [];
    if (!scanComponents) return componentLayer;

    for (let i = 0; i < scanComponents.length; i++) {
      try {
        // qualityValue would have a number from 0 to 5 or undefined.
        const qualityValue = Number(
          scanComponents[i]?.quality?.shift()?.score?.split('/').shift()
        );

        //Generates a new component
        const newComponent: ComponentDataLayer = {
          key: scanComponents[i].purl[0],
          purls: scanComponents[i].purl,
          name: scanComponents[i].component,
          url: scanComponents[i].url,
          vendor: scanComponents[i].vendor,
          health: scanComponents[i].health,
          versions: [
            {
              version: scanComponents[i].version,
              licenses: scanComponents[i].licenses.map(
                (license) => license.name
              ),
              copyrights: scanComponents[i].copyrights,
              quality: { sum: 0, scoreAvg: 0, count: 0 },
              cryptography: scanComponents[i]?.cryptography,
            },
          ],
        };

        //Removes duplicated licenses
        newComponent.versions[0].licenses = [
          ...new Set(newComponent.versions[0].licenses),
        ];

        if (qualityValue) {
          newComponent.versions[0].quality.count = 1;
          newComponent.versions[0].quality.sum = qualityValue;
          newComponent.versions[0].quality.scoreAvg = qualityValue;
        }

        //Merge new component in componentList
        const componentTarget = componentLayer.find(
          (component) => component.key === newComponent.key
        );
        if (componentTarget) {
          const versionTarget = componentTarget.versions.find(
            (item) => item.version === newComponent.versions[0].version
          );
          if (versionTarget) {
            //Insert licenses
            newComponent.versions[0].licenses.forEach((licence) => {
              if (!versionTarget.licenses.includes(licence))
                versionTarget.licenses.push(licence);
            });

            //Insert copyright
            newComponent.versions[0]?.copyrights?.forEach((newCopyright) => {
              if (
                versionTarget.copyrights.every(
                  (copyright) => newCopyright.name != copyright.name
                )
              ) {
                versionTarget.copyrights.push(newCopyright);
              }
            });

            //Insert cryptography
            newComponent.versions[0]?.cryptography?.forEach((newCryptoAlgo) => {
              if (
                versionTarget.cryptography.every(
                  (cryptoAlgorithm) =>
                    cryptoAlgorithm.algorithm != newCryptoAlgo.algorithm
                )
              ) {
                versionTarget.cryptography.push(newCryptoAlgo);
              }
            });

            //recalculate quality average in case we have a quality value
            if (qualityValue) {
              versionTarget.quality.count++;
              versionTarget.quality.sum += Number(qualityValue);
              versionTarget.quality.scoreAvg =
                versionTarget.quality.sum / versionTarget.quality.count;
            }
          } else {
            //newComponent version is not included in the component with same purl key
            componentTarget.versions = componentTarget.versions.concat(
              newComponent.versions
            );
          }
        } else componentLayer.push(newComponent);
      } catch (e) {
        console.error(
          `Problem inserting new component building Component Data Layer - `,
          e
        );
      }
    }

    //Replace [] for null in versions
    for (let i = 0; i < componentLayer.length; i++) {
      if (!componentLayer[i].health) componentLayer[i].health = null;
      componentLayer[i].versions.forEach((version) => {
        if (version.copyrights?.length == 0) version.copyrights = null;
        if (version.licenses?.length == 0) version.licenses = null;
        if (version.cryptography?.length === 0) version.cryptography = null;
        if (version.quality.count === 0) version.quality = null;
      });
    }

    return componentLayer;
  }
}
