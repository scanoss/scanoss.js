import { ScannerInput } from "../ScannerTypes";
import { WfpCalculator } from "./WfpCalculator/WfpCalculator";
import { WfpSplitter } from "./WfpSplitter/WfpSplitter";

export class WfpProviderFactory {

  static create(scannerInput: ScannerInput) {
    if (scannerInput.fileScan) return new WfpCalculator();
    if (scannerInput.wfpScan) return new WfpSplitter();
    return null;
  }



}
