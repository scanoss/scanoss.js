import {
  ILicenses,
  IReportData,
  IReportEntry,
  ISaveResponse,
  SaveStatus
} from './types';
import { ReportAdapter } from './ReportAdapter';
const fs = require('fs').promises;
const f = require('fs');
const path = require('path')


export const reportDefaultPath = {
  html:'src/lib/modules/reports/htmlReport/template.html'
}

export abstract class Report{
  private resultPath: string;
  private dependenciesPath : string;
  private vulnerabilitiesPath: string;
  private readonly basePath: string;
  private licenseMapper :Record<string, ILicenses> = {};
  private fileExtension: string;


protected constructor(params: IReportEntry) {
  this.resultPath = params.resultPath;
  this.dependenciesPath = params.dependencyPath? params.dependencyPath : null;
  this.vulnerabilitiesPath = params.vulnerabilityPath? params.vulnerabilityPath : null;
  this.basePath = params.basePath;
  this.fileExtension = null;
}

  public abstract generate();

  protected setFileExtension(ext: string){
    this.fileExtension = ext;
  }

  protected abstract validTemplateExtension(): boolean;

  protected async save(file: string, fileName:string, folder:string) :Promise<ISaveResponse> {
    try {
      let stat = await fs.stat(`${this.basePath}`);
      if(stat.isDirectory()) {
        if (!f.existsSync(`${this.basePath}/${folder}`)) {
          await fs.mkdir(`${this.basePath}/${folder}`);
        }
        await fs.writeFile(`${this.basePath}/${folder}/${fileName}`, file);
        return {
          status: SaveStatus.OK,
          path: `${this.basePath}${folder}/${fileName}`,
          format: path.extname(`${this.basePath}/${folder}/${fileName}`),
        };
      }
    }
    catch (error:any){
      return {
        status: SaveStatus.FAILED,
        path: this.basePath,
        format: path.extname(this.basePath),
        message: error.message
      };
    }
  }

  protected async readFile(path: string): Promise<any> {
    const data = await fs.readFile(path);
    return data;
  }

  public async getReportData(): Promise<IReportData>{
    const reportAdapter = new ReportAdapter(this);
    const results = await this.readFile(this.resultPath);
    reportAdapter.getResultLicenses(JSON.parse(results));
  if(this.dependenciesPath){
    const dependencies = await this.readFile(this.dependenciesPath);
    reportAdapter.getDependenciesLicenses(JSON.parse(dependencies).filesList);
  }
  return {
    licenses: Object.values((this.licenseMapper)),
    summary: {
      summary: {
        matchFiles: 0,
        noMatchFiles: 0,
        filterFiles: 0,
        totalFiles: 0,
      },
      identified: {
        scan: 0,
        total:0,
      },
      pending: 0,
      original: 0,
  }
  }
}

public getLicenseMapper(): Record<string,ILicenses>{
    return this.licenseMapper;
}







}
