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
        if (d.component !== '' && d.version !== '') {
          d.licensesList.map((l) => {
            const component = this.getNewComponent(d.purl,null,d.version,d.component,'');
            if (l.name !== '') {
              if (!this.report.getLicenseMapper()[l.name]) {
                this.report.getLicenseMapper()[l.name] = {
                  label: l.name,
                  value: 1,
                  copyleft: false,
                  hasIncompatibles: [],
                  incompatibleWith: [],
                  components: [component],
                }
              } else {
                this.addComponentToLicense(l.name,d.purl,d.version,component);
              }
            }
          });
        }
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
      if(!auxVersion) this.report.getLicenseMapper()[license].components[auxComp].versions.push(version);
    } else{
      this.report.getLicenseMapper()[license].value++;
      this.report.getLicenseMapper()[license].components.push(component);
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

