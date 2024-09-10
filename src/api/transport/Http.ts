import axios, { AxiosInstance } from "axios";
import { Transport } from "./index";
import { ExtractServiceMethod, ScanossServices } from "../types";

type RouteMap = {
  [S in keyof ScanossServices]: {
    [M in keyof ScanossServices[S]]: string;
  };
};

interface HttpTransportOptions {
  baseURL: string;
  apiKey: string;
  clientName: string;
}

export class Http implements Transport {
  private client: AxiosInstance;
  private options: HttpTransportOptions;
  private routeMap: RouteMap;

  constructor(options?: HttpTransportOptions) {
    this.options = options;
    this.client = axios.create({
      baseURL: this.options.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.options.apiKey,
      },
    });

    this.routeMap = {
      cryptography: {
        algorithms: '/api/v2/cryptography/algorithms',
        echo: '/api/v2/cryptography/echo'
      },
      dependency: {
        echo: '/api/v2/dependency/echo',
        get: '/api/v2/dependency/dependencies'
      }
    };
  }

  async execute<S extends keyof ScanossServices, M extends keyof ScanossServices[S]>(
    service: S,
    method: M,
    params: ExtractServiceMethod<S, M>['params']
  ): Promise<ExtractServiceMethod<S, M>['result']> {
    const endpoint = this.getEndpoint(service, method);
    if (!endpoint) {
      throw new Error(`No endpoint found for ${String(service)}.${String(method)}`);
    }

    const response = await this.client.post(endpoint, params);
    return response.data;
  }

  private getEndpoint<S extends keyof ScanossServices, M extends keyof ScanossServices[S]>(
    service: S,
    method: M
  ): string | undefined {
    return this.routeMap[service]?.[method];
  }


}
