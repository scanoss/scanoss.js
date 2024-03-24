import { FingerprintPackage } from '../WfpProvider/FingerprintPackage';
import FormData from 'form-data';
import { SbomMode } from '../ScannerTypes';
export declare class DispatchableItem {
    private form;
    private errorCounter;
    private fingerprintPackage;
    private engineFlags;
    private sbom;
    private sbomMode;
    constructor();
    private _uuid;
    get uuid(): string;
    set uuid(uuid: string);
    getForm(): FormData;
    increaseErrorCounter(): void;
    getErrorCounter(): number;
    setFingerprintPackage(fingerprintPackage: FingerprintPackage): void;
    getFingerprintPackage(): FingerprintPackage;
    setEngineFlags(engineFlags: number): void;
    setSbom(sbom: string, sbomMode: SbomMode): void;
}
