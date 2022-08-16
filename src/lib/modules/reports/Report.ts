import {
  IReportData,
  IReportEntry,
  ISaveResponse,
  SaveStatus
} from './types';
import { ReportAdapter } from './ReportAdapter';
const fs = require('fs').promises;
const path = require('path')


export const reportDefaultPath = {
  html:'src/lib/modules/reports/htmlReport/template.html'
}

export abstract class Report{
  private resultPath: string;
  private dependenciesPath : string;
  private vulnerabilitiesPath: string;
  private readonly outputPath: string;
  private reportData :IReportData;

protected constructor(params: IReportEntry) {
  this.resultPath = params.resultPath;
  this.dependenciesPath = params.dependencyPath? params.dependencyPath : null;
  this.vulnerabilitiesPath = params.vulnerabilityPath? params.vulnerabilityPath : null;
  this.outputPath = params.outputPath;
}

  public abstract generate();

  protected abstract validTemplateExtension(): boolean;

  protected async save(file: string) :Promise<ISaveResponse> {
    try {
      await fs.promises.writeFile(file, this.outputPath);
      return {
        status: SaveStatus.OK,
        path: this.outputPath,
        format: path.extname(this.outputPath),
      };
    }
    catch (error:any){
        return {
          status: SaveStatus.FAILED,
          path: this.outputPath,
          format: path.extname(this.outputPath),
        };
    }
  }

  protected async readFile(path: string): Promise<any> {
    const data = await fs.readFile(path);
    return data;
  }

  protected async getReportData(): Promise<IReportData>{
    const reportAdapter = new ReportAdapter(this);
    const results = await this.readFile(this.resultPath);
    reportAdapter.getResultLicenses(JSON.parse(results));
  if(this.dependenciesPath){
    const dependencies = await this.readFile(this.dependenciesPath);
    reportAdapter.getDependenciesLicenses(JSON.parse(dependencies).filesList);
  }
  return {
    licenses: Object.values((this.reportData)),
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

public getData(): IReportData{
    return this.reportData;
}







}
