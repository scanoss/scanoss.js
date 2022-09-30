import fs from 'fs';
import path from 'path';
import { DataProviderManager } from '../../sdk/DataLayer/DataProviderManager';
import { IDataLayers } from '../../sdk/DataLayer/DataLayerTypes';


const reportDefaultPath = path.join(__dirname,"../../../../assets/ReportHTMLTemplate/index.html");

export class Report {

  private dataProviderManager: DataProviderManager;

  private dataLayer: IDataLayers;

  constructor(dpm: DataProviderManager = new DataProviderManager()) {
    this.dataProviderManager = dpm;
  }

  public setDataProviderManager(dpm: DataProviderManager) {
    this.dataProviderManager = dpm;
  }

  public async getHTML(): Promise<string> {
    this.dataLayer = this.dataProviderManager.generateData();
    const html = (await fs.promises.readFile(reportDefaultPath, 'utf-8'));
    if(!html) throw new Error('Invalid template path');
    return html.replace('#DATA',JSON.stringify(this.dataLayer));
  }

}
