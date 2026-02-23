import { FingerprintPackage } from '../WfpProvider/FingerprintPackage';
import FormData from 'form-data';
import { SbomMode } from '../ScannerTypes';
import { FileSnippetSettings } from "../ScannnerResultPostProcessor/interfaces/types";

export class DispatchableItem {
  private form: FormData;

  private errorCounter: number;

  private fingerprintPackage: FingerprintPackage;

  private engineFlags: number;

  private sbom: string;

  private sbomMode: SbomMode;

  private scanSettings: FileSnippetSettings;

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

    if (this.sbomMode && this.sbom) {
      this.form.append('assets', this.sbom);
      this.form.append('type', this.sbomMode);
    }

    return this.form;
  }

  public getScanSettings(): FileSnippetSettings | undefined {
    return this.scanSettings;
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

  public setScanSettings(fileSnippetSettings: FileSnippetSettings) {
    this.scanSettings = fileSnippetSettings;
  }
}
