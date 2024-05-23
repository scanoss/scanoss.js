import { BaseScanner } from './BaseScanner';
import { ContentScanner } from './ContentScanner';
import { FileScanner } from './FileScanner';
import { ScannerResponse } from './ScannerTypes';

export class ScannerVisitor {

  public async scanFiles(fileScanner: FileScanner):Promise<ScannerResponse> {
    return await fileScanner.initScan();
  }

  public async scanContents(contentScanner: ContentScanner):Promise<ScannerResponse> {
    return await contentScanner.initScan();
  }

}
