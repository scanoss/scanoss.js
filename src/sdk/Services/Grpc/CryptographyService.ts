import { CryptographyClient } from './scanoss/api/cryptography/v2/scanoss-cryptography_grpc_pb';
import * as CryptographyMessages from './scanoss/api/cryptography/v2/scanoss-cryptography_pb';
import { BaseService, PurlRequest } from './BaseService';
import { ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED } from '../../Errors';

export interface AlgorithmResponse
  extends CryptographyMessages.AlgorithmResponse.AsObject {}

export interface HintsResponse
  extends CryptographyMessages.HintsInRangeResponse.AsObject {}

export class CryptographyService extends BaseService {
  public static readonly serviceName = 'CryptographyService';
  private client: CryptographyClient;

  /**
   * Creates CryptographyService Instance.
   * @param {string} token - Optional. API TOKEN.
   * @param {string} hostName - Optional. Destination Host.
   * @param {string} proxyHost -Optional. Proxy Host.
   * @param {string} caCertPath - Optional. Path to certificates.
   */
  constructor(token: string, hostName: string ,proxyHost?: string, caCertPath?: string) {
    super({
      HOSTNAME: hostName,
      PROXY_URL: proxyHost,
      CA_CERT: caCertPath,
      SERVICE_NAME: CryptographyService.serviceName,
      IS_PREMIUM_SERVICE: true,
      API_TOKEN: token,
    });
    this.client = new CryptographyClient(
      this.HOSTNAME,
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
