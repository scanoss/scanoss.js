import {
  ComponentCryptographyResultCollector
} from "../../Helper/ResultCollector/Component/ComponentCryptographyResultColletor";

import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";
import { AlgorithmResponse } from "../../../Clients/Cryptography/ICryptographyClient";
import { CryptographyClient } from "../../../Clients/Cryptography/CryptographyClient";
import { Component } from "../../../types/common/types";

/**
 * Scanner for detecting cryptographic algorithms in software components.
 * This class extends the base cryptography scanner to specifically handle
 * component-level cryptographic algorithm detection using a remote service.
 */
export class ComponentAlgorithmScanner
  extends BaseCryptographyScanner<
    ComponentCryptographyResultCollector,
    Component[],
    AlgorithmResponse>{

  /**
   * Scans components identified by PURL for cryptographic algorithms.
   * This method connects to a cryptography service to retrieve algorithm
   * information for the specified components.
   * @param components A request containing PURL (Package URL) identifiers for components to scan.
   * @returns {AlgorithmResponse} A promise that resolves to an AlgorithmResponse containing detected cryptographic algorithms.
   */
  public async scan(components: Component[]):Promise<AlgorithmResponse> {
    const cryptographyClient = new CryptographyClient(
      this.config.API_KEY, // API KEY
      this.config.API_URL, // Destination Host
      this.config.GRPC_PROXY, // Proxy Host
      this.config.CA_CERT);
    const results:AlgorithmResponse = await cryptographyClient.getAlgorithms(components);
    this.resultCollector.collectAlgorithmResults(results);
    return results;
  }
}
