import {
  ComponentCryptographyResultCollector
} from "../../Helper/ResultCollector/Component/ComponentCryptographyResultColletor";
import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";
import { HintsInRangeResponse } from "../../../Clients/Cryptography/ICryptographyClient";
import { Component } from "../../../types/common/types";
import { CryptographyHttpClient } from "../../../Clients/Cryptography/CryptographyHttpClient";
import { ClientConfig } from "../../../Clients/interfaces/ClientConfig";


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
      API_KEY: this.config.API_KEY,
      HTTP_PROXY: this.config.HTTP_PROXY,
      HTTPS_PROXY: this.config.HTTPS_PROXY,
      NO_PROXY: this.config.NO_PROXY,
      CA_CERT: this.config.CA_CERT,
      IGNORE_CERT_ERRORS: this.config.IGNORE_CERT_ERRORS,
      HOST_URL: this.config.API_URL, // Only map the one that differs. TODO: Migrate to HOST URL on v1 version
    };
    const cryptographyClient = new CryptographyHttpClient(clientCfg);
    const results = await cryptographyClient.getEncryptionHints(req);
    this.resultCollector.collectHintResults(results);
    return results;
  }
}
