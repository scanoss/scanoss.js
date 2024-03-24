import { IWfpProviderInput, WfpProvider } from "../WfpProvider";
import { ScannerCfg } from "../../ScannerCfg";
export declare class WfpSplitter extends WfpProvider {
    private continue;
    private wfpStream;
    private chunkDataRead;
    private fingerprints;
    private fingerprintIndex;
    private timer;
    private ignoreFiles;
    constructor(scannerCfg?: ScannerCfg);
    start(params: IWfpProviderInput): Promise<void>;
    stop(): void;
    pause(): void;
    resume(): void;
    private sendFingerprints;
    private stopSendFingerprints;
    private streamBufferFlush;
    private setStreamListeners;
    private splitFingerprints;
}
