import fs from 'fs';
import path from 'path';
import { DataProviderManager } from '../../sdk/DataLayer/DataProviderManager';
import { IDataLayers } from '../../sdk/DataLayer/DataLayerTypes';


const reportDefaultPath = path.join(__dirname,"../../../../../assets/htmlTemplate/template.html");


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
    console.log(this.dataLayer);
    const html = (await fs.promises.readFile(reportDefaultPath, 'utf-8'));
    if(!html) throw new Error('Invalid template path');
    return html.replace('#DATA',JSON.stringify(this.dataLayer));
  }

}
