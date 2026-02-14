import { FingerprintPackage } from '../WfpProvider/FingerprintPackage';
import FormData from 'form-data';
import { SbomMode } from '../ScannerTypes';

export class DispatchableItem {
  private form: FormData;

  private errorCounter: number;

  private fingerprintPackage: FingerprintPackage;

  private engineFlags: number;

  private sc: string;

  private context: string;

  private sbom: string;

  private sbomMode: SbomMode;

  constructor() {
    this.errorCounter = 0;
    this.form = new FormData();
  }

  private _uuid: string;

  public get uuid(): string {
    return this._uuid;
  }

  public set uuid(uuid: string) {
    this._uuid = uuid;
  }

  public getForm(): FormData {
    this.form = new FormData();

    this.form.append(
      'file',
      Buffer.from(this.fingerprintPackage.getContent()),
      'data.wfp'
    );
    if (this.engineFlags) this.form.append('flags', this.engineFlags);
    if (this.sc) this.form.append('sc', this.sc);
    if (this.context) this.form.append('context', this.context);

    if (this.sbomMode && this.sbom) {
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

  public setSc(sc: string) {
    this.sc = sc;
  }

  public setContext(context: string) {
    this.context = context;
  }

  public setSbom(sbom: string, sbomMode: SbomMode) {
    this.sbom = sbom;
    this.sbomMode = sbomMode;
  }
}
