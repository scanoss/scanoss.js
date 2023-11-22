import fs from 'fs';
import path from 'path';
import { DataProviderManager } from './DataLayer/DataProviderManager';
import { IDataLayers } from './DataLayer/DataLayerTypes';

export class Report {
  private dataProviderManager: DataProviderManager;

  private dataLayer: IDataLayers;

  private report: string;

  private templatePath: string = path.join(
    __dirname,
    '../../../../assets/ReportHTMLTemplate/index.html'
  );

  private dataPlaceholder: string = '#DATA';
  constructor(dpm: DataProviderManager = new DataProviderManager()) {
    this.dataProviderManager = dpm;
  }

  public setDataProviderManager(dpm: DataProviderManager) {
    this.dataProviderManager = dpm;
  }

  public setTemplatePath(filePath: string) {
    this.templatePath = filePath;
  }

  public getTemplatePath(): string {
    return this.templatePath;
  }

  public async getHTML(): Promise<string> {
    this.dataLayer = await this.dataProviderManager.generateData();
    const html = await fs.promises.readFile(this.getTemplatePath(), 'utf-8');
    if (!html) throw new Error('Invalid template path');
    if (!html.includes(this.dataPlaceholder))
      throw new Error(
        `Placeholder ${this.dataPlaceholder} not found, cannot insert the data`
      );
    this.report = html.replace(
      this.dataPlaceholder,
      JSON.stringify(this.dataLayer).replace(/\\\"/g, '\\\\u0022')
    );

    return this.report;
  }

  public async saveToFile(fsPath: string) {
    return await fs.promises.writeFile(fsPath, this.report, 'utf-8');
  }
}
