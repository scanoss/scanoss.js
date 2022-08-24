import { Report } from './Report';
import { Component, ILicenses } from './types';

export class ReportAdapter {
private report: Report;
  constructor(report: Report) {
    this.report = report;
  }

  public getResultLicenses(results: Record<string, any>): void {
      const licenses = {};
      Object.entries(results).forEach(([key,value])=>{
        value.forEach((v)=>{
          if(v.id!='none'){
            this.report.getSummary().matchedFiles++;
            // Licenses
            v.licenses.forEach((l)=>{
              const component =   this.getNewComponent(v.purl[0],v.vendor,v.version,v.component,v.url);
              if(!this.report.getLicenseMapper()[l.name]) {
                this.report.getLicenseMapper()[l.name] = {
                  value: 1,
                  label: l.name,
                  copyleft: l.copyleft === 'yes' ? true : false,
                  hasIncompatibles: [],
                  incompatibleWith:  l.incompatible_with!== undefined ? l.incompatible_with.split(',').map(il=> il.trim()) : [] ,
                  components: [component]
                };
              }else {
                this.addComponentToLicense(l.name,v.purl[0],v.version,component);
              }
            });
          }else{
            this.report.getSummary().noMatchFiles++;
          }
        });
      });
    }

    public getTotalFiles(results: Record<string, any>): number {
       return Object.keys(results).length;
    }

  public getDependenciesLicenses(dependencies:any): void {
    dependencies.map((f) => {
      //dependencies
      f.dependenciesList.map((d) => {
          d.licensesList.map((licenses) => {
            const component = this.getNewComponent(d.purl,null,d.version,d.component,'');
            if (licenses.spdxId !== '') {
              licenses.spdxId.split(/;|\//g).forEach((l) => {
                if (!this.report.getLicenseMapper()[l]) {
                  this.report.getLicenseMapper()[l] = {
                    label: l,
                    value: 1,
                    copyleft: false,
                    hasIncompatibles: [],
                    incompatibleWith: [],
                    components: [component],
                  }
                } else {
                  this.addComponentToLicense(l, d.purl, d.version, component);
                }
              });
            }else{ //Unknown licenses
              if(!this.report.getLicenseMapper()['unknown']){
                this.report.getLicenseMapper().unknown = {
                  label: 'unknown',
                  value: 1,
                  copyleft: false,
                  hasIncompatibles: [],
                  incompatibleWith: [],
                  components: [component],
                };
              }else{
                this.addComponentToLicense('unknown', d.purl, d.version, component);
              }
            }
          });
      });
    });
  }

  private getNewComponent(purl:string,vendor:string,version:string,name:string,url:string): Component{
    return  {
      purl,
      vendor: vendor ? vendor : '',
      versions: [version],
      name: name ? name : '',
      url,
    };
  }

  private addComponentToLicense(license:string, purl:string,version:string, component:Component){
    const auxComp =  this.report.getLicenseMapper()[license].components.findIndex((c)=> c.purl === purl);
    if(auxComp >= 0) { //if component exists
      const auxVersion =  this.report.getLicenseMapper()[license].components[auxComp].versions.find((version)=>version === version);
      if(!auxVersion){
        this.report.getLicenseMapper()[license].components[auxComp].versions.push(version);
        this.report.getLicenseMapper()[license].value++;
      }
    } else{
      this.report.getLicenseMapper()[license].components.push(component);
      this.report.getLicenseMapper()[license].value++;
    }
  }

public checkForIncompatibilities(licenses: Array<ILicenses>) {
  for (let l = 0; l < licenses.length; l += 1) {
    const license = licenses[l];
    if (license.incompatibleWith !== undefined)
      for (let i = 0; i < license.incompatibleWith.length; i += 1) {
        if (licenses.some((lic) => lic.label === license.incompatibleWith[i]))
          license.hasIncompatibles.push(license.incompatibleWith[i]);
      }
  }
}
}

