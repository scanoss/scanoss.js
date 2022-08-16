import { Report, reportDefaultPath } from '../Report';
import {
  IReportData,
  IReportEntry,
  ISaveResponse
} from '../types';

const path = require('path')

export class HTMLReport extends Report{
    private html: string;
    private htmlTemplatePath: string;
    private extension : string;

    constructor(params: IReportEntry) {
      super(params);
      this.htmlTemplatePath = params.templatePath? params.templatePath : reportDefaultPath.html;
      this.html = null;
      this.extension = '.html';
    }

    public async generate():Promise<string> {
      const reportData = await this.getReportData();
      await this.setDataOnHtmlFile(reportData);
      return this.html;
    }

    private async setDataOnHtmlFile(reportData: IReportData){
      if(this.validTemplateExtension()){
        const html = (await this.readFile(this.htmlTemplatePath)).toString();
        html.replace('#DATA',reportData.licenses);
        html.replace('#SUMMARY',reportData.summary);
        this.html = html;
      }
      throw new Error('Invalid template extension')
    }

    public async save():Promise<ISaveResponse> {
        const response = await super.save(this.html);
        return  response;
    }

  protected  validTemplateExtension() : boolean {
  const templateExtension =   path.extname(this.htmlTemplatePath)
  return templateExtension === this.extension;
  }

}
