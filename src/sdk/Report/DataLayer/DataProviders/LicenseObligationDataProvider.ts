import {
  DataProvider,
  IDataLayers,
  LicenseComponent,
  LicenseDataLayer,
  LicenseObligation,
} from '../DataLayerTypes';
import {
  ScannerComponent,
  ScannerResults,
} from '../../../scanner/ScannerTypes';
import { IDependencyResponse } from '../../../Dependencies/DependencyTypes';

export class LicenseObligationDataProvider implements DataProvider {
  private scanResults: ScannerResults;

  private dependencies: IDependencyResponse;
  private licenseLayer: LicenseObligation[];
  private componentList: ScannerComponent[];

  private licenseSet: Record<string, LicenseObligation>;
  constructor(scanResults: ScannerResults, dependencies?: IDependencyResponse) {
    this.scanResults = scanResults;
    this.dependencies = dependencies;

    //Maps a license name to its own data
    this.licenseSet = {};
    this.licenseLayer = [];
  }

  public getLayerName(): string {
    return 'License Obligation Layer';
  }

  public async getData(): Promise<IDataLayers> {
    /* Get licenses from Scan Results */
    this.componentList = Object.values(this.scanResults).flat();
    this.componentList = this.componentList.filter(
      (component) => component.id !== 'none'
    );

    if (this.componentList.length > 0) {
      this.componentList.forEach((component) => {
        component.licenses.forEach((license) => {
          if (!this.licenseSet[license.name]) {
            this.licenseSet[license.name] = {
              copyleft:
                license.copyleft?.toLowerCase() === 'yes' ? true : false,
              label: license.name,
              hasIncompatibles: [],
              incompatibleWith: license.incompatible_with
                ? license.incompatible_with.split('')
                : [],
            };
          }
        });
      });
    }

    /* Get licenses from Dependencies Results */
    if (this.dependencies && this.dependencies.filesList.length > 0) {
      this.dependencies.filesList.forEach((file) => {
        file.dependenciesList.forEach((dependency) => {
          dependency.licensesList.forEach((license) => {
            license.spdxId?.split(/;|\//g).forEach((spdxid) => {
              if (spdxid !== '' && !this.licenseSet[spdxid]) {
                this.licenseSet[spdxid] = {
                  copyleft: false,
                  label: spdxid,
                  hasIncompatibles: [],
                  incompatibleWith: [],
                };
              }
            });
          });
        });
      });
    }

    const allSpdxid = Object.keys(this.licenseSet);
    const allLicenses = Object.values(this.licenseSet);

    const licensesObligations = allLicenses.map((l) => {
      l.incompatibleWith = l.incompatibleWith.filter((spdxid) =>
        allSpdxid.includes(spdxid)
      );
      return l;
    });

    return { licensesObligations } as IDataLayers;
  }
}
