import { HttpClient } from "../http/HttpClient";
import { logger } from "../../Logger";
import {
  ICryptographyClient,
  AlgorithmResponse,
  HintsInRangeResponse
} from "./ICryptographyClient";
import { validateComponents } from "../helper/clientHelper";
import { Component } from "../../types/common/types";
export class CryptographyHttpClient extends HttpClient implements ICryptographyClient {

  private client: HttpClient;
  private readonly baseUrl: string;

  constructor(token: string, hostName: string, proxyHost?: string, caCertPath?: string) {
    super();
    this.client = new HttpClient({
      HOST_URL: hostName,
      API_KEY: token,
      HTTPS_PROXY: proxyHost,
      CA_CERT: caCertPath,
    });
    this.baseUrl = hostName;
  }

  public async getAlgorithms(components: Component[]): Promise<AlgorithmResponse> {
    try {
      validateComponents(components);
      const response = await this.client.post(`${this.baseUrl}/api/v2/cryptography/algorithms`, { purls: components });

      if (response.ok) {
        const algorithms = await response.json();
        return algorithms as AlgorithmResponse;
      }

      const errorText = await response.text();
      const errorMessage = `Failed to get algorithms: ${response.status} ${response.statusText} - ${errorText}`;
      logger.log(`Error getting algorithms: ${errorMessage}`);
      throw new Error(errorMessage);
    } catch (error) {
      logger.log('Error getting algorithms:', error);
      throw this.handleError(error, 'Failed to get algorithms');
    }
  }

  public async getEncryptionHints(components: Component[]): Promise<HintsInRangeResponse> {
    try {
      validateComponents(components);
      const response = await this.client.post(`${this.baseUrl}/api/v2/cryptography/hintsInRange`, { purls: components });

      if (response.ok) {
        const hints = await response.json();
        return hints as HintsInRangeResponse;
      }

      const errorText = await response.text();
      const errorMessage = `Failed to get encryption hints: ${response.status} ${response.statusText} - ${errorText}`;
      logger.log(`Error getting encryption hints: ${errorMessage}`);
      throw new Error(errorMessage);
    } catch (error) {
      logger.log('Error getting encryption hints:', error);
      throw this.handleError(error, 'Failed to get encryption hints');
    }
  }
}
