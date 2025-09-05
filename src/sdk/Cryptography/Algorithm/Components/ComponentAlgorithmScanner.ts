import {
  ComponentCryptographyResultCollector
} from "../../Helper/ResultCollector/Component/ComponentCryptographyResultColletor";

import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";
import { AlgorithmResponse } from "../../../Clients/Cryptography/ICryptographyClient";
import { Component } from "../../../types/common/types";
import { CryptographyHttpClient } from "../../../Clients/Cryptography/CryptographyHttpClient";
import { ClientConfig } from "../../../Clients/http/HttpClient";

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
    const clientCfg: ClientConfig = {
      ...this.config,
      HOST_URL: this.config.API_URL, // Only map the one that differs. TODO: Migrate to HOST URL on v1 version
    };
    const cryptographyClient = new CryptographyHttpClient(clientCfg);
    const results:AlgorithmResponse = await cryptographyClient.getAlgorithms(components);
    this.resultCollector.collectAlgorithmResults(results);
    return results;
  }
}
