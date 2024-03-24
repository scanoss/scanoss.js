import EventEmitter from 'eventemitter3';
import { IWfpProviderInput } from './WfpProvider/WfpProvider';
export declare class Fingerprint extends EventEmitter {
    private wfpCalculator;
    private fingerprintPath;
    private finishPromise;
    private finishPromiseResolve;
    private finishPromiseReject;
    private reportStatusAfter;
    private queue;
    constructor(reportStatusAfter?: number);
    private configureWfpCalculator;
    start(jobs: Array<IWfpProviderInput>): Promise<void>;
    abort(): void;
    setFingerprintPath(fingerprintsFilePath: string): void;
}
