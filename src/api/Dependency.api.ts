import { BaseApi } from "./Base.api";
import { Transport } from "./transport";
import {
  DependencyRequest,
  DependencyResponse,
  EchoRequest,
  EchoResponse
} from "./types";

export class DependencyApi extends BaseApi<'dependency'> {
  constructor(t: Transport) {
    super(t, 'dependency');
  }

  async echo(r: EchoRequest): Promise<EchoResponse> {
    return this.call('echo', r);
  }

  async get(params: DependencyRequest): Promise<DependencyResponse> {
    return this.call('get', params);
  }

}
