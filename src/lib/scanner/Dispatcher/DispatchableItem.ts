import { FingerprintPackage } from '../WfpProvider/FingerprintPackage';
import FormData from 'form-data';
import { SbomMode } from '../ScannerTypes';

export class DispatchableItem {
  private readonly form: FormData;

  private errorCounter: number;

  private fingerprintPackage: FingerprintPackage;

  private engineFlags: number;

  private sbom: string;

  private sbomMode: SbomMode;

  constructor() {
    this.errorCounter = 0;
    this.form = new FormData();
  }

  public getForm(): FormData {
    this.form.append('filename', Buffer.from(this.fingerprintPackage.getContent()), 'data.wfp');
    if(this.engineFlags) this.form.append('flags', this.engineFlags);

    if(this.sbomMode && this.sbom) {
      this.form.append('assets', this.sbom);
      this.form.append('type', this.sbomMode);
    }

    return this.form;
  }

  public increaseErrorCounter() {
    this.errorCounter += 1;
  }

  public getErrorCounter() {
    return this.errorCounter;
  }

  public setFingerprintPackage(fingerprintPackage: FingerprintPackage) {
    this.fingerprintPackage = fingerprintPackage;
  }

  public getFingerprintPackage(): FingerprintPackage {
    return this.fingerprintPackage;
  }

  public setEngineFlags(engineFlags: number) {
    this.engineFlags = engineFlags;
  }

  public setSbom(sbom: string, sbomMode: SbomMode) {
    this.sbom = sbom;
    this.sbomMode = sbomMode;
  }



}
