import AbortController from 'abort-controller';
export declare class GlobalControllerAborter {
    private abortControllerList;
    private abortFlag;
    constructor();
    abortAll(): void;
    isAborting(): Boolean;
    getAbortController(): AbortController;
    removeAbortController(c: any): void;
}
