import { BaseScanner } from './BaseScanner';
import { ScannerVisitor } from './ScannerVisitor';
import { ScannerInput, ScannerResponse } from './ScannerTypes';
import { ScannerCfg } from './ScannerCfg';

export class FileScanner extends BaseScanner {

  private scannerInputs: Array<ScannerInput>;

  constructor(scannerInputs: Array<ScannerInput>) {
    super();
    this.scannerInputs =  scannerInputs;
  }

  public async initScan(): Promise<ScannerResponse> {
    return await this.startScan(this.scannerInputs)
  }

  public async scan(scannerVisitor: ScannerVisitor):Promise<ScannerResponse> {
    return await scannerVisitor.scanFiles(this);
  }

}
