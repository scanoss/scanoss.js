import EventEmitter from 'eventemitter3';
import { ScannerCfg } from '../ScannerCfg';
import { DispatchableItem } from './DispatchableItem';
export declare class Dispatcher extends EventEmitter {
    private scannerCfg;
    private pQueue;
    private globalAbortController;
    private queueMaxLimitReached;
    private queueMinLimitReached;
    private recoverableErrors;
    private proxyAgent;
    private caCert;
    constructor(scannerCfg?: ScannerCfg);
    init(): void;
    stop(): void;
    dispatchItem(item: DispatchableItem): void;
    emitUnrecoberableError(error: any, disptItem: any, response: string): void;
    emitNoDispatchedItem(disptItem: any): void;
    errorHandler(error: Error, disptItem: DispatchableItem, response: string): void;
    dispatch(item: DispatchableItem): Promise<void>;
}
