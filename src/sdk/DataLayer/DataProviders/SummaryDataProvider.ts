import { DataProvider, IDataLayers, SummaryDataLayer } from '../DataLayerTypes';
import {
  ScannerComponent,
  ScannerComponentId,
  ScannerResults
} from '../../scanner/ScannerTypes';

export class SummaryDataProvider implements DataProvider {

  private scannerResults: ScannerResults;

  private componentList: Array<ScannerComponent>;

  private summary: SummaryDataLayer;

  private projectName: string;

  private projectCreateAt: Date;

  constructor(projectName: string, projectCreatedAt: Date, scannerResults: ScannerResults) {
    this.scannerResults = scannerResults;
    this.projectName = projectName;
    this.projectCreateAt = projectCreatedAt

    this.summary = <SummaryDataLayer>{};
    this.componentList = [];
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public getData(): IDataLayers {
    this.componentList = Object.values(this.scannerResults).flat();

    this.summary.projectName = this.projectName;
    this.summary.timestamp = this.projectCreateAt;
    this.summary.totalFiles = 0;
    this.summary.noMatchFiles = 0;
    this.summary.matchedFiles = 0;

    this.componentList.forEach(component => {
      if (component.id==ScannerComponentId.NONE) this.summary.noMatchFiles++;
      else this.summary.matchedFiles++;
      this.summary.totalFiles++;
    });

    return <IDataLayers>{summary: this.summary};
  }

}
