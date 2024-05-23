import { BaseScanner } from './BaseScanner';
import os from 'os';
import fs from 'fs';
import path from 'path';
import {
  ContentScannerInput,
  ScannerComponent,
  ScannerInput, ScannerResponse
} from './ScannerTypes';
import { ScannerVisitor } from './ScannerVisitor';

export class ContentScanner extends BaseScanner {

  private input: ScannerInput;
  constructor(scannerInput: ScannerInput) {
    super();
    this.input = scannerInput;
  }

  public async initScan(): Promise<ScannerResponse> {
    if (!this.input.content && !this.input.content.data) {
      this.reportLog('[ SCANNER ]: No input provided', 'warning');
      return null;
    }
    const workingDir = `${os.tmpdir()}/${this.getScanFolderId()}`;
    this.setWorkDirectory(workingDir);
    this.workDirectory = workingDir;

    await fs.promises.writeFile(`${workingDir}/${this.input.content.key}`, this.input.content.data, 'utf-8');

    const rootPath = path.resolve(`${workingDir}/${this.input.content.key}`);

    // Build the input for a common scan
    const scannerInput: ScannerInput = {
      folderRoot: workingDir,
      fileList: [rootPath],
    };

    // Perform a common scan
    const scannerResponse = await this.startScan([scannerInput]);
    const results =JSON.parse(await fs.promises.readFile(scannerResponse.resultPath, 'utf-8')) as ScannerComponent
    return {...scannerResponse, results  }
  }

  public async scan(scannerVisitor: ScannerVisitor): Promise<ScannerResponse> {
      return await scannerVisitor.scanContents(this);
  }

}
