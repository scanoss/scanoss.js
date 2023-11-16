import { DataProvider, IDataLayers, SummaryDataLayer } from '../DataLayerTypes';
import {
  ScannerComponent,
  ScannerComponentId,
  ScannerResults,
} from '../../../scanner/ScannerTypes';

export class SummaryDataProvider implements DataProvider {
  private scannerResults: ScannerResults;

  private summary: SummaryDataLayer;

  private projectName: string;

  private projectCreateAt: Date;

  constructor(
    projectName: string,
    projectCreatedAt: Date,
    scannerResults: ScannerResults
  ) {
    this.scannerResults = scannerResults;
    this.projectName = projectName;
    this.projectCreateAt = projectCreatedAt;
    this.summary = <SummaryDataLayer>{};
  }

  public getLayerName(): string {
    return this.constructor.name;
  }

  public async getData(): Promise<IDataLayers> {
    this.summary.projectName = this.projectName;
    this.summary.timestamp = this.projectCreateAt;
    this.summary.totalFiles = 0;
    this.summary.noMatchFiles = 0;
    this.summary.matchedFiles = 0;

    for (const [file, components] of Object.entries(this.scannerResults)) {
      components.forEach((component) => {
        if (component.id == ScannerComponentId.NONE)
          this.summary.noMatchFiles++;
        else this.summary.matchedFiles++;
        this.summary.totalFiles++;
      });
    }

    return <IDataLayers>{ summary: this.summary };
  }
}
