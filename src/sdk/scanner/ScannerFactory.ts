import { ScannerInput } from './ScannerTypes';
import { BaseScanner } from './BaseScanner';
import { ContentScanner } from './ContentScanner';
import { FileScanner } from './FileScanner';

export class ScannerFactory {

  public static create(scannerInput: Array<ScannerInput>): BaseScanner {
    if(scannerInput[0].content) {
      return new ContentScanner(scannerInput[0]);
    }else {
      return new FileScanner(scannerInput);
    }
 }

}
