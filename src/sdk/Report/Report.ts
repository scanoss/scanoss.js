import fs from 'fs';
import path from 'path';
import { DataProviderManager } from './DataLayer/DataProviderManager';
import { IDataLayers } from './DataLayer/DataLayerTypes';

const reportDefaultPath = path.join(
  __dirname,
  '../../../../assets/ReportHTMLTemplate/index.html'
);

export class Report {
  private dataProviderManager: DataProviderManager;

  private dataLayer: IDataLayers;

  private report: string;

  constructor(dpm: DataProviderManager = new DataProviderManager()) {
    this.dataProviderManager = dpm;
  }

  public setDataProviderManager(dpm: DataProviderManager) {
    this.dataProviderManager = dpm;
  }

  public async getHTML(): Promise<string> {
    this.dataLayer = await this.dataProviderManager.generateData();
    const html = await fs.promises.readFile(reportDefaultPath, 'utf-8');
    if (!html) throw new Error('Invalid template path');
    this.report = html.replace('#DATA', JSON.stringify(this.dataLayer));
    return this.report;
  }

  public async saveToFile(fsPath: string) {
    return await fs.promises.writeFile(fsPath, this.report, 'utf-8');
  }
}
