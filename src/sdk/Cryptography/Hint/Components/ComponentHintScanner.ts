import {
  ComponentCryptographyResultCollector
} from "../../Helper/ResultCollector/Component/ComponentCryptographyResultColletor";
import { PurlRequest } from "../../../Services/Grpc/BaseService";
import { CryptographyService,
  HintsResponse } from "../../../Services/Grpc/CryptographyService";
import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";

/**
 * Scanner for detecting cryptographic hints in software components.
 * This class extends the base cryptography scanner to specifically handle
 * component-level cryptographic hint detection using a remote service.
 */
export class ComponentHintScanner
  extends BaseCryptographyScanner<
    ComponentCryptographyResultCollector,
    PurlRequest,
    HintsResponse>{

  /**
   * Scans components identified by PURL for cryptographic hints.
   * This method connects to a cryptography service to retrieve encryption
   * hints for the specified components.
   * @param req A request containing PURL (Package URL) identifiers for components to scan.
   * @returns {HintsResponse} A promise that resolves to a HintsResponse containing detected cryptographic hints.
   */
  public async scan(req: PurlRequest):Promise<HintsResponse>{
    const cryptographyService = new CryptographyService(
      this.config.getApikey(), // API KEY
      this.config.GRPC_PROXY,
      this.config.CA_CERT);
    const results = await cryptographyService.getEncryptionHints(req);
    this.resultCollector.collectHintResults(results);
    return results;
  }
}
