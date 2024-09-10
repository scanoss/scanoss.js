// Define the Strategy interface
import { ExtractServiceMethod, ScanossServices } from "../types";

export interface Transport {
  execute<S extends keyof ScanossServices, M extends keyof ScanossServices[S]>(
    service: S,
    method: M,
    params: ExtractServiceMethod<S, M>['params']
  ): Promise<ExtractServiceMethod<S, M>['result']>;

}
