/// <reference types="node" />
import { ScannableItem } from "../../Scannable/ScannableItem";
import { ScannerCfg } from "../../ScannerCfg";
import { IWfpProviderInput, WfpProvider } from "../WfpProvider";
export declare class WfpCalculator extends WfpProvider {
    private fileList;
    private fileListIndex;
    private continue;
    constructor(scannerCfg?: ScannerCfg);
    init(): void;
    prepareWorker(): void;
    recoveryIndex(): 0 | -1;
    forceStopWorker(): void;
    getNextScannableItem(): Promise<ScannableItem>;
    readFile(path: string): Promise<Buffer>;
    isFileGreaterThanLimit(path: string): Promise<boolean>;
    nextStepMachine(): Promise<void>;
    start(params: IWfpProviderInput): Promise<void>;
    pause(): void;
    resume(): void;
    stop(): void;
    protected processPackedWfp(content: any): void;
}
