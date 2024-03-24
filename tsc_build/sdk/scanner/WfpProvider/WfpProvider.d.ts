/// <reference types="node" />
import { Worker } from 'worker_threads';
import EventEmitter from 'eventemitter3';
import { ScannerCfg } from '../ScannerCfg';
import { WinnowingMode } from '../ScannerTypes';
import { FingerprintPackage } from './FingerprintPackage';
export interface IWfpProviderInput {
    wfpPath?: string;
    folderRoot?: string;
    fileList?: Array<string>;
    winnowingMode?: WinnowingMode;
    obfuscate?: boolean;
}
export declare abstract class WfpProvider extends EventEmitter {
    protected wfp: string;
    protected scannerCfg: ScannerCfg;
    protected folderRoot: string;
    protected worker: Worker;
    protected pendingFiles: boolean;
    protected winnowingMode: WinnowingMode;
    protected finishPromise: Promise<void>;
    protected obfuscate: boolean;
    protected finishPromiseResolve: (value?: void | PromiseLike<void>) => void;
    protected finishPromiseReject: (value?: void | PromiseLike<void>) => void;
    abstract start(params: IWfpProviderInput): Promise<void>;
    abstract stop(): void;
    abstract pause(): void;
    abstract resume(): void;
    hasPendingFiles(): boolean;
    protected init(): void;
    protected fingerprintPacker(fingerprint: string): boolean;
    protected finishWinnowing(): void;
    protected sendFingerprint(fingerprintPackage: FingerprintPackage): void;
    protected sendLog(logMsg: string): void;
    protected sendError(errorMsg: string): void;
    protected setWinnowingMode(mode: WinnowingMode): void;
}
