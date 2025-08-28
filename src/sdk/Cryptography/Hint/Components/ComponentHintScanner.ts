import {
  ComponentCryptographyResultCollector
} from "../../Helper/ResultCollector/Component/ComponentCryptographyResultColletor";
import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";
import { Component } from "../../../shared/interfaces/Component";
import { HintsInRangeResponse } from "../../../Clients/Cryptography/ICryptographyClient";
import { CryptographyClient } from "../../../Clients/Cryptography/CryptographyClient";

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
  public async scan(req: Component[]):Promise<HintsInRangeResponse>{
    const cryptographyClient = new CryptographyClient(
      this.config.API_KEY, // API KEY
      this.config.API_URL, // Destination Host
      this.config.GRPC_PROXY, // Proxy Host
      this.config.CA_CERT);
    const results = await cryptographyClient.getEncryptionHints(req);
    this.resultCollector.collectHintResults(results);
    return results;
  }
}
