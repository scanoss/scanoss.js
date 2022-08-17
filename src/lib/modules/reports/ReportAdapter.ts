import { Report } from './Report';

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
            // Licenses
            v.licenses.forEach((l)=>{
              const component = {
                purl: v.purl[0],
                vendor: v.vendor,
                version: v.version,
                name: v.component,
                url: v.url,
              };
              if(!this.report.getLicenseMapper()[l.name]) {
                this.report.getLicenseMapper()[l.name] = {
                  value: 1,
                  label: l.name,
                  components: [component]
                };
              }else {
                const componentIndex =  this.report.getLicenseMapper()[l.name].components.findIndex((c)=> c.purl === v.purl[0] && c.version === v.version );
                if(componentIndex<0) {
                  this.report.getLicenseMapper()[l.name].components.push(component);
                  this.report.getLicenseMapper()[l.name].value = this.report.getLicenseMapper()[l.name].value + 1;
                }
              }
            });
          }
        });
      });
    }

  public getDependenciesLicenses(dependencies:any): void {
    dependencies.map((f) => {
      //dependencies
      f.dependenciesList.map((d) => {
        if (d.component !== '' && d.version !== '') {
          d.licensesList.map((l) => {
            const component = {
              purl: d.purl,
              vendor: '',
              version: d.version,
              name: d.component,
              url: ''
            };
            if (l.name !== '') {
              if (!this.report.getLicenseMapper()[l.name]) {
                this.report.getLicenseMapper()[l.name] = {
                  label: l.name,
                  value: 1,
                  components: [component],
                }
              } else {
                const componentIndex = this.report.getLicenseMapper()[l.name].components.findIndex((c) => c.purl === d.purl && c.version === d.version);
                if (componentIndex < 0) {
                  this.report.getLicenseMapper()[l.name].components.push(component);
                  this.report.getLicenseMapper()[l.name].value = this.report.getLicenseMapper()[l.name].value + 1;
                }
              }
            }
          });
        }
      });
    });
  }
}
