import {
  ExtractServiceMethod,
  ScanossServices
} from "./types";
import { Transport } from "./transport";

/**
 * BaseApi class
 *
 * Base class for all API classes in the SCANOSS SDK.
 * This class provides a common interface for all API classes to communicate with the SCANOSS server.
 *
 * @template S - The service key (must be a key of ScanossServices)
 */
export abstract class BaseApi<S extends keyof ScanossServices> {
  protected constructor(protected t: Transport, protected serviceName: S) {}

  protected async call<M extends keyof ScanossServices[S]>(
    method: M,
    params: ExtractServiceMethod<S, M>["params"]
  ): Promise<ExtractServiceMethod<S, M>["result"]> {
    return this.t.execute(this.serviceName, method, params);
  }

}
