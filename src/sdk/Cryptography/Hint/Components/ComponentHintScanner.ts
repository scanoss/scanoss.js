import {
  ComponentCryptographyResultCollector
} from "../../Helper/ResultCollector/Component/ComponentCryptographyResultColletor";
import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";
import { HintsInRangeResponse } from "../../../Clients/Cryptography/ICryptographyClient";
import { Component } from "../../../types/common/types";
import { CryptographyHttpClient } from "../../../Clients/Cryptography/CryptographyHttpClient";
import { ClientConfig } from "../../../Clients/http/HttpClient";

/**
 * Scanner for detecting cryptographic hints in software components.
 * This class extends the base cryptography scanner to specifically handle
 * component-level cryptographic hint detection using a remote service.
 */
export class ComponentHintScanner
  extends BaseCryptographyScanner<
    ComponentCryptographyResultCollector,
    Component[],
    HintsInRangeResponse>{

  /**
   * Scans components identified by PURL for cryptographic hints.
   * This method connects to a cryptography service to retrieve encryption
   * hints for the specified components.
   * @param req A request containing PURL (Package URL) identifiers for components to scan.
   * @returns {HintsResponse} A promise that resolves to a HintsResponse containing detected cryptographic hints.
   */
  public async scan(req: Component[]):Promise<HintsInRangeResponse> {
    const clientCfg: ClientConfig = {
      ...this.config,
      HOST_URL: this.config.API_URL, // Only map the one that differs. TODO: Migrate to HOST URL on v1 version
    };
    const cryptographyClient = new CryptographyHttpClient(clientCfg);
    const results = await cryptographyClient.getEncryptionHints(req);
    this.resultCollector.collectHintResults(results);
    return results;
  }
}
