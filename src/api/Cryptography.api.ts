import { BaseApi } from "./Base.api";
import { Transport } from "./transport";
import { EchoRequest, EchoResponse } from "./types";

/**
 * CryptographyApi encapsulates all cryptography-related operations in the SCANOSS SDK.
  */
export class CryptographyApi extends BaseApi<'cryptography'> {
  constructor(t: Transport) {
    super(t, 'cryptography');
  }

  async echo(r: EchoRequest): Promise<EchoResponse> {
    return this.call('echo', r);
  }

}

