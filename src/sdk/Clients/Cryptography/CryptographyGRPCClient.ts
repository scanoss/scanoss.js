import { CryptographyClient as GrpcCryptographyClient } from '../Grpc/scanoss/api/cryptography/v2/scanoss-cryptography_grpc_pb';
import { BaseGRPCClient, PurlRequest } from '../Grpc/BaseGRPCClient';
import {
  ICryptographyClient,
  AlgorithmResponse,
  HintsInRangeResponse
} from './ICryptographyClient';
import { logger } from '../../Logger/Logger';
import { Component } from "../../types/common/types";

/**
 * @deprecated This gRPC client is deprecated. Use CryptographyHttpClient instead.
 */
export class CryptographyGRPCClient extends BaseGRPCClient implements ICryptographyClient {
  public static readonly clientName = 'Cryptography gRPC Client';
  private client: GrpcCryptographyClient;

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
      CLIENT_NAME: CryptographyGRPCClient.clientName,
      API_TOKEN: token,
    });
    this.client = new GrpcCryptographyClient(
      this.HOSTNAME,
      this.generateChannelCredentials()
    );
  }

  public async getAlgorithms(components: Component[]): Promise<AlgorithmResponse> {
    this.validateComponents(components);

    const req: PurlRequest = {
      purlsList: components.map(comp => ({
        purl: comp.purl,
        requirement: comp.requirement || ''
      }))
    };

    return new Promise((resolve, reject) => {
      this.client.getAlgorithms(
        this.buildGRPCPurlRequest(req),
        (err, response: any) => {
          if (err) {
            const errorMessage = `Failed to get algorithms: ${err.message}`;
            logger.log(`Error getting algorithms: ${errorMessage}`);
            reject(new Error(errorMessage));
            return;
          }
          try {
            const result = this.handleResponse(response.toObject());
            resolve(this.transformGrpcAlgorithmResponse(result));
          } catch (e) {
            const errorMessage = `Failed to process algorithms response: ${e instanceof Error ? e.message : 'Unknown error'}`;
            logger.log(`Error processing algorithms response: ${errorMessage}`);
            reject(new Error(errorMessage));
          }
        }
      );
    });
  }

  public async getEncryptionHints(components: Component[]): Promise<HintsInRangeResponse> {
    this.validateComponents(components);

    const req: PurlRequest = {
      purlsList: components.map(comp => ({
        purl: comp.purl,
        requirement: comp.requirement || ''
      }))
    };

    return new Promise((resolve, reject) => {
      this.client.getHintsInRange(
        this.buildGRPCPurlRequest(req),
        (err, response: any) => {
          if (err) {
            const errorMessage = `Failed to get encryption hints: ${err.message}`;
            logger.log(`Error getting encryption hints: ${errorMessage}`);
            reject(new Error(errorMessage));
            return;
          }
          try {
            const result = this.handleResponse(response.toObject());
            resolve(this.transformGrpcHintsResponse(result));
          } catch (e) {
            const errorMessage = `Failed to process hints response: ${e instanceof Error ? e.message : 'Unknown error'}`;
            logger.log(`Error processing hints response: ${errorMessage}`);
            reject(new Error(errorMessage));
          }
        }
      );
    });
  }

  private validateComponents(components: Component[]): void {
    if (!components || components.length === 0) {
      throw new Error('Components array cannot be empty');
    }

    if (!Array.isArray(components)) {
      throw new Error('Components must be an array');
    }

    for (const component of components) {
      if (!component.purl || typeof component.purl !== 'string') {
        throw new Error('Each component must have a valid purl string');
      }
    }
  }

  private transformGrpcAlgorithmResponse(grpcResponse: any): AlgorithmResponse {
    return {
      components: grpcResponse.components?.map((purl: any) => ({
        purl: purl.purl,
        version: purl.version || '',
        algorithms: purl.algorithmsList?.map((algo: any) => ({
          algorithm: algo.algorithm,
          strength: algo.strength
        })) || []
      })) || [],
      status: {
        status: grpcResponse.status?.status || 'UNKNOWN',
        message: grpcResponse.status?.message || ''
      }
    };
  }

  private transformGrpcHintsResponse(grpcResponse: any): HintsInRangeResponse {
    return {
      components: grpcResponse.components?.map((purl: any) => ({
        purl: purl.purl,
        version: purl.version || '',
        versions: purl.versionsList || [],
        hints: purl.hintsList?.map((hint: any) => ({
          id: hint.id,
          name: hint.name,
          description: hint.description,
          category: hint.category,
          url: hint.url,
          purl: hint.purl
        })) || []
      })) || [],
      status: {
        status: grpcResponse.status?.status || 'UNKNOWN',
        message: grpcResponse.status?.message || ''
      }
    };
  }
}
