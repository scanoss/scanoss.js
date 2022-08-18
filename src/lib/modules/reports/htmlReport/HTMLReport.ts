import { Report, reportDefaultPath } from '../Report';
import {
  IReportData,
  IReportEntry,
  ISaveResponse
} from '../types';

const path = require('path')

export class HTMLReport extends Report{
    private html: string;
    private readonly htmlTemplatePath: string;
    private readonly extension : string;
    private readonly fileName : string;
    private readonly folder: string;

    constructor(params: IReportEntry) {
      super(params);
      this.htmlTemplatePath = params.templatePath? params.templatePath : reportDefaultPath.html;
      this.html = null;
      this.extension = '.html';
      this.folder = 'HTML';
      this.fileName = 'report.html';
      super.setFileExtension(this.extension);
    }

    public async generate():Promise<string> {
      const reportData = await this.getReportData();
      await this.setDataOnHtmlFile(reportData);
      return this.html;
    }

    private async setDataOnHtmlFile(reportData: IReportData){
      if(!this.validTemplateExtension()) throw new Error('Invalid template extension');
        let html = (await this.readFile(this.htmlTemplatePath)).toString();
        if(!html) throw new Error('Invalid template path');
        html = html.replace('#DATA',JSON.stringify(reportData));
        this.html = html;
    }

    public async save():Promise<ISaveResponse> {
        const response = await super.save(this.html,this.fileName, this.folder);
        return  response;
    }

  protected  validTemplateExtension() : boolean {
  const templateExtension =   path.extname(this.htmlTemplatePath)
  return templateExtension === this.extension;
  }

}
