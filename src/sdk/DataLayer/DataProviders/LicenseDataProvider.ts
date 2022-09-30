import {
  DataProvider,
  IDataLayers,
  LicenseComponent,
  LicenseDataLayer
} from '../DataLayerTypes';
import {
  ScannerComponent,
  ScannerResults
} from '../../scanner/ScannerTypes';
import { IDependencyResponse } from '../../Dependencies/DependencyTypes';

export class LicenseDataProvider implements DataProvider {

  private scanResults: ScannerResults

  private componentList: ScannerComponent[];

  private dependencies: IDependencyResponse;

  private licenseStorage: Record<string, LicenseDataLayer>;

  private licenseLayer: Array<LicenseDataLayer>;

  constructor(scanResults: ScannerResults, dependencies?: IDependencyResponse ) {
    this.scanResults = scanResults;
    this.dependencies = dependencies;

    //Maps a license name to its own data
    this.licenseStorage = {};
    this.licenseLayer = [];
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public getData(): IDataLayers {

    this.componentList = Object.values(this.scanResults).flat();
    this.componentList = this.componentList.filter(component => component.id!=='none')

    if (this.componentList.length >0)
      this.updateLicenseStorageFromComponentList();

    if (this.dependencies && this.dependencies.filesList.length > 0)
      this.updateLicenseStorageFromDependencies();


    this.licenseLayer = Object.values(this.licenseStorage);
    if (this.licenseLayer.length > 0)
      this.updateIncompatibilities();

    this.licenseLayer.sort((itemA, itemB) => {
      if (itemA.value > itemB.value) return -1
      else if (itemA.value < itemB.value) return 1
      return 0;
    });

    return {licenses: this.licenseLayer} as IDataLayers
  }

  //Gets all license from the result of scan and stores in this.licenseStorage map
  private updateLicenseStorageFromComponentList() {
    this.componentList.forEach(component => {
      component.licenses.forEach((license) => {

        const newLicenseComponent: LicenseComponent = <LicenseComponent>{};
        newLicenseComponent.purl = component.purl[0];
        newLicenseComponent.vendor = component.vendor;
        newLicenseComponent.versions = [component.version];
        newLicenseComponent.name = component.component
        newLicenseComponent.url = component.url;

        const licenseExist = !!this.licenseStorage[license.name];
        if(!licenseExist){
          const newLicense: LicenseDataLayer = <LicenseDataLayer>{};
          newLicense.value = 1;
          newLicense.label = license.name;
          newLicense.copyleft = license.copyleft === 'yes' ? true : false;
          newLicense.hasIncompatibles = [];
          newLicense.incompatibleWith = license.incompatible_with!== undefined ? license.incompatible_with.split(',').map(il=> il.trim()) : [];
          newLicense.components = [newLicenseComponent];
          this.licenseStorage[license.name] = newLicense;
        } else {
          this.licenseStorage[license.name] = this.insertComponentIntoLicense(this.licenseStorage[license.name], newLicenseComponent);
        }
      });
    });
  }

  //Gets all licenses from results of dependency analysis
  private updateLicenseStorageFromDependencies() {
    this.dependencies.filesList.forEach(file => {
      file.dependenciesList.forEach(dependency => {
        dependency.licensesList.forEach(license => {


          const newLicenseComponent = <LicenseComponent>{};
          newLicenseComponent.purl = dependency.purl;
          newLicenseComponent.versions = [dependency.version];
          newLicenseComponent.name = dependency.component;
          newLicenseComponent.vendor = null;
          newLicenseComponent.url = null;

          if(license.spdxId !== '') {
            license.spdxId.split(/;|\//g).forEach(license_name => {

              const licenseExist = !!this.licenseStorage[license_name];
              if (!licenseExist) {
                const newLicense: LicenseDataLayer = <LicenseDataLayer>{};
                newLicense.value = 1;
                newLicense.label = license_name;
                newLicense.copyleft = false;
                newLicense.hasIncompatibles = [];
                newLicense.incompatibleWith = [];
                newLicense.components = [newLicenseComponent];
                this.licenseStorage[license_name] = newLicense;
              } else {
                this.licenseStorage[license_name] = this.insertComponentIntoLicense(this.licenseStorage[license_name], newLicenseComponent);
              }
            });
          } else { // Unknown license
            const licenseExist = !!this.licenseStorage['unknown'];
            if (licenseExist) {
              const newLicense: LicenseDataLayer = <LicenseDataLayer>{};
              newLicense.value = 1;
              newLicense.label = 'unknown';
              newLicense.copyleft = false;
              newLicense.hasIncompatibles = [];
              newLicense.incompatibleWith = [];
              newLicense.components = [newLicenseComponent];
              this.licenseStorage['unknown'] = newLicense;
            } else{
              this.licenseStorage['unknown'] = this.insertComponentIntoLicense(this.licenseStorage['unknown'], newLicenseComponent);
            }
          }
        });
      });
    });
  }

  private updateIncompatibilities() {
    for (let l = 0; l < this.licenseLayer.length; l += 1) {
      const license = this.licenseLayer[l];
      if (license.incompatibleWith !== undefined)
        for (let i = 0; i < license.incompatibleWith.length; i += 1) {
          if (this.licenseLayer.some((lic) => lic.label === license.incompatibleWith[i]))
            license.hasIncompatibles.push(license.incompatibleWith[i]);
        }
    }
  }


  private insertComponentIntoLicense(license: LicenseDataLayer, newComponent: LicenseComponent): LicenseDataLayer {
    const componentIndex = license.components.findIndex((c)=> c.purl === newComponent.purl);
    if (componentIndex >= 0) {  //if newComponent exist in license
      const versionExist = !!license.components[componentIndex].versions.find((version)=>version === newComponent.versions[0]);
      if (!versionExist) {
        license.components[componentIndex].versions.push(newComponent.versions[0]);
        license.value++;
      }
    } else {
      license.components.push(newComponent);
      license.value++;
    }
    return license;
  }

  private unknownLicensesToEnd(){
    // let unknownLicenses = null;
    // if(this.licenseMapper['unknown']){
    //   unknownLicenses =  this.licenseMapper['unknown'];
    //   delete this.licenseMapper['unknown'];
    // }
    //
    // this.licenses =  Object.values((this.licenseMapper));
    // if(unknownLicenses){
    //   this.licenses.push(unknownLicenses);
    // }
  }


}
