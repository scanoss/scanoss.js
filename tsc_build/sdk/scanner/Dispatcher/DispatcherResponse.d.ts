export declare class DispatcherResponse {
    serverResponse: any;
    wfpContent: string;
    filesScanned: Array<string>;
    constructor(serverResponse: any, wfpContent: any);
    getServerResponse(): any;
    getWfpContent(): string;
    matchRegex(str: any, re?: RegExp): any;
    verifyResponse(): void;
    getFilesScanned(): string[];
    getNumberOfFilesScanned(): number;
}
