import { DependencyScannerCfg } from './DependencyScannerCfg';
import { IDependencyResponse } from './DependencyTypes';
export declare class DependencyScanner {
    private localDependency;
    private grpcDependencyService;
    constructor(cfg?: DependencyScannerCfg);
    scanFolder(path: string): Promise<IDependencyResponse>;
    scan(files: Array<string>): Promise<IDependencyResponse>;
    private purlAdapter;
    private buildRequest;
    private repairOutput;
}
