import { BaseApi } from "./Base.api";
import { Transport } from "./transport";
import { EchoRequest, EchoResponse } from "./types";

export class CryptographyApi extends BaseApi<'cryptography'> {
  constructor(t: Transport) {
    super(t, 'cryptography');
  }

  async echo(r: EchoRequest): Promise<EchoResponse> {
    return this.call('echo', r);
  }

}

