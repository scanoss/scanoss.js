import { ScannerVisitor } from './ScannerVisitor';
import { BaseScanner } from './BaseScanner';
import { ScannerCfg } from './ScannerCfg';
import EventEmitter from 'eventemitter3';
import { ScannerEvents, ScannerInput, ScannerResponse } from './ScannerTypes';
import { ScannerFactory } from './ScannerFactory';

export class Scanner extends EventEmitter {

  private scannerCfg: ScannerCfg;
  constructor(scannerCfg: ScannerCfg =  new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
  }
  public async scan(scannerInput: Array<ScannerInput>):Promise<ScannerResponse> {
    // Get type of scanner based on source

    const scanner: BaseScanner = ScannerFactory.create(scannerInput);

    scanner.setScannerCfg(this.scannerCfg);
    // Set up listeners for events emitted by BaseScanner
    scanner.on('DISPATCHER_NEW_DATA', (dispResp: { getFilesScanned: () => number[] }) => {
      this.emit('DISPATCHER_NEW_DATA',dispResp)
    });

    scanner.on('SCAN_DONE', async (resultPath: string, filesNotScanned) => {
      this.emit(
        ScannerEvents.SCAN_DONE,
        resultPath,
        filesNotScanned
      );
    });

    scanner.on('SCANNER_LOG', (logText: string, level = 'info') => {
      this.emit(ScannerEvents.SCANNER_LOG,logText, level);
    });

    scanner.on(ScannerEvents.RESULTS_APPENDED, (responses, filesNotScanned) => {
      this.emit(ScannerEvents.RESULTS_APPENDED,responses, filesNotScanned);
    });

    const scannerVisitor = new ScannerVisitor();
    return await scanner.scan(scannerVisitor);
  }

}
