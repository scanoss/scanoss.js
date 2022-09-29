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

//TODO finish this class.
//Implement unknowk licenses
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
      this.updateLicenseStorageIncompatibilities();

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
          this.licenseStorage[license.name] = this.insertComponentIntoLicense(this.licenseStorage[license.name], component);
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

          const existsLicense = license.spdxId.length > 0;
          if (!existsLicense) {

          } else {
            //this.insertComponentIntoLicense(this.)
          }

        });
      });
    });
  }

  private updateLicenseStorageIncompatibilities(){

  }


  private insertComponentIntoLicense(license: LicenseDataLayer, component: ScannerComponent): LicenseDataLayer{
    //Check whether component exist on this specific license (license.name)
    const componentExist = license.components.findIndex((c)=> c.purl === component.purl[0]);
    if (componentExist >= 0) {
      const versionExist = license.components[componentExist].versions.find((version)=>version === component.version);
      if (!versionExist) {
        license.components[componentExist].versions.push(component.version);
        license.value++;
      }
    } else {
      // const newLicenseComponent = this.newLicenseComponent(component);
      // license.components.push(newLicenseComponent);
      // license.value++;
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
