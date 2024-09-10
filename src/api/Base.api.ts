import {
  ExtractServiceMethod,
  ScanossServices
} from "./types";
import { Transport } from "./transport";

export abstract class BaseApi<S extends keyof ScanossServices> {
  protected constructor(protected t: Transport, protected serviceName: S) {}

  protected async call<M extends keyof ScanossServices[S]>(
    method: M,
    params: ExtractServiceMethod<S, M>["params"]
  ): Promise<ExtractServiceMethod<S, M>["result"]> {
    return this.t.execute(this.serviceName, method, params);
  }

}
