import { HttpClient } from "../http/HttpClient";
import { logger } from "../../Logger";
import {
  ICryptographyClient,
  AlgorithmResponse,
  HintsInRangeResponse
} from "./ICryptographyClient";
import { validateComponents } from "../helper/clientHelper";
import { Component } from "../../types/common/types";
import { ClientConfig } from "../interfaces/ClientConfig";

/**
 * HTTP client for cryptography-related API operations.
 * Provides methods to retrieve cryptographic algorithms and encryption hints for components.
 */
export class CryptographyHttpClient extends HttpClient implements ICryptographyClient {
  /**
   * Creates a new CryptographyHttpClient instance.
   * @param clientConfig - Configuration for the HTTP client
   */
  constructor(clientConfig: ClientConfig) {
    super(clientConfig);
  }

  /**
   * Retrieves cryptographic algorithms for the specified components.
   * @param components - Array of components to analyze for cryptographic algorithms
   * @returns Promise resolving to algorithm information for each component
   * @throws Error if the request fails or components validation fails
   */
  public async getAlgorithms(components: Component[]): Promise<AlgorithmResponse> {
    try {
      validateComponents(components);
      const URL = `${this.hostURL()}/v2/cryptography/algorithms/components`;
      const response = await this.post(URL, { components: components });
      if (response.ok) {
        const algorithms = await response.json();
        return algorithms as AlgorithmResponse;
      }

      if(response.status === 404){
        const responseData = await response.json();
        const errorMessage = `Failed to get algorithms: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`;
        logger.log(`Error getting algorithms: ${errorMessage}`);
        return responseData as AlgorithmResponse;
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

  /**
   * Retrieves encryption hints for the specified components.
   * @param components - Array of components to analyze for encryption hints
   * @returns Promise resolving to encryption hints information for each component
   * @throws Error if the request fails or components validation fails
   */
  public async getEncryptionHints(components: Component[]): Promise<HintsInRangeResponse> {
    try {
      validateComponents(components);
      const URL = `${this.hostURL()}/v2/cryptography/hints/components`;
      const response = await this.post(URL, { components: components });

      if (response.ok) {
        const hints = await response.json();
        return hints as HintsInRangeResponse;
      }
      if(response.status === 400){
        const errorText = await response.text();
        const errorMessage = `Failed to get encryption hints: ${response.status} ${response.statusText} - ${errorText}`;
        logger.log(`Error getting encryption hints: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if(response.status === 404){
        const responseData = await response.json();
        const errorMessage = `Failed to get encryption hints: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`;
        logger.log(`Error getting encryption hints: ${errorMessage}`);
        return responseData as HintsInRangeResponse;
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
