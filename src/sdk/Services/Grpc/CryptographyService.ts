import { CryptographyClient } from './scanoss/api/cryptography/v2/scanoss-cryptography_grpc_pb';
import * as CryptographyMessages from './scanoss/api/cryptography/v2/scanoss-cryptography_pb';
import { BaseService, PurlRequest } from './BaseService';
import { ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED } from '../../Errors';

export interface AlgorithmResponse
  extends CryptographyMessages.AlgorithmResponse.AsObject {}

export interface HintsResponse
  extends CryptographyMessages.HintsInRangeResponse.AsObject {}

export class CryptographyService extends BaseService {
  private client: CryptographyClient;

  constructor(token: string, proxy?: string, ca_cert?: Buffer) {
    super();
    this.SERVICE_NAME = 'CryptographyService';
    this.IS_PREMIUM_SERVICE = true;
    this.API_TOKEN = token;

    if (this.IS_PREMIUM_SERVICE && !this.API_TOKEN)
      throw new Error(ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED);

    if (proxy) process.env.grpc_proxy = proxy;

    this.client = new CryptographyClient(
      this.GRPC_ENDPOINT,
      this.generateChannelCredentials()
    );
  }

  public async getAlgorithms(req: PurlRequest): Promise<AlgorithmResponse> {
    return new Promise((resolve, reject) => {
      this.client.getAlgorithms(
        this.buildGRPCPurlRequest(req),
        (err, response) => {
          if (err) reject(err);
          try {
            // @ts-ignore
            resolve(this.handleResponse(response.toObject()));
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }

  public async getEncryptionHints(req: PurlRequest): Promise<HintsResponse> {
    return new Promise((resolve, reject) => {
      this.client.getHintsInRange(
        this.buildGRPCPurlRequest(req),
        (err, response) => {
          if (err) reject(err);
          try {
            // @ts-ignore
            resolve(this.handleResponse(response.toObject()));
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }
}
