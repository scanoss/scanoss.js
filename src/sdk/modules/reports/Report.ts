import {
  ILicenses,
  IReportData,
  IReportEntry,
  ISaveResponse,
  SaveStatus, Summary
} from './types';
import { ReportAdapter } from './ReportAdapter';
const fs = require('fs').promises;
const f = require('fs');
const path = require('path')

export const reportDefaultPath = {
  html: path.join(__dirname,"../../../../../assets/htmlTemplate/template.html")
}

export abstract class Report{
  private readonly resultPath: string;
  private readonly dependenciesPath : string;
  private vulnerabilitiesPath: string;
  private readonly outputPath: string;
  private licenseMapper :Record<string, ILicenses> = {};
  private fileExtension: string;
  private summary : Summary;
  private readonly projectName: string;
  private licenses: Array<ILicenses>;

  protected constructor(params: IReportEntry) {
    this.projectName = params.projectName
    this.resultPath = params.resultPath;
    this.dependenciesPath = params.dependencyPath? params.dependencyPath : null;
    this.vulnerabilitiesPath = params.vulnerabilityPath? params.vulnerabilityPath : null;
    this.outputPath = params.outputPath;
    this.fileExtension = null;
    this.summary = { matchedFiles:0, noMatchFiles:0, totalFiles:0 };
  }

  public abstract generate();

  protected setFileExtension(ext: string){
    this.fileExtension = ext;
  }

  protected abstract validTemplateExtension(): boolean;

  protected async save(file: string, fileName:string, folder:string) :Promise<ISaveResponse> {
    try {
        await fs.writeFile(this.outputPath, file);
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
        message: error.message
      };
    }
  }

  protected async readFile(path: string): Promise<any> {
    const data = await fs.readFile(path);
    return data;
  }

  public async getReportData(): Promise<IReportData> {
    const reportAdapter = new ReportAdapter(this);
    const results = await this.readFile(this.resultPath);
    const r =  JSON.parse(results);
    reportAdapter.getResultLicenses(r);
    this.summary.totalFiles = reportAdapter.getTotalFiles(r);
    if (this.dependenciesPath) {
      const dependencies = await this.readFile(this.dependenciesPath);
      reportAdapter.getDependenciesLicenses(JSON.parse(dependencies).filesList);
    }

    // set unknown licenses to the of the array
    this.unknownLicensesToEnd();

    reportAdapter.checkForIncompatibilities(this.licenses);
    return {
      projectName: this.projectName,
      licenses: this.licenses,
      summary: this.summary,
      date: new Date().toLocaleTimeString(),
    }
  }

  private unknownLicensesToEnd(){
    let unknownLicenses = null;
    if(this.licenseMapper['unknown']){
      unknownLicenses =  this.licenseMapper['unknown'];
      delete this.licenseMapper['unknown'];
    }

    this.licenses =  Object.values((this.licenseMapper));
    if(unknownLicenses){
      this.licenses.push(unknownLicenses);
    }
  }

  public getLicenseMapper(): Record<string,ILicenses>{
    return this.licenseMapper;
  }

  public getSummary() : Summary{
    return this.summary;
  }

}
