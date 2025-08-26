import {
  ComponentCryptographyResultCollector
} from "../../Helper/ResultCollector/Component/ComponentCryptographyResultColletor";
import {
  AlgorithmResponse,
  CryptographyService
} from "../../../Services/Grpc/CryptographyService";
import { PurlRequest } from "../../../Services/Grpc/BaseService";
import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";

/**
 * Scanner for detecting cryptographic algorithms in software components.
 * This class extends the base cryptography scanner to specifically handle
 * component-level cryptographic algorithm detection using a remote service.
 */
export class ComponentAlgorithmScanner
  extends BaseCryptographyScanner<
    ComponentCryptographyResultCollector,
    PurlRequest,
    AlgorithmResponse>{

  /**
   * Scans components identified by PURL for cryptographic algorithms.
   * This method connects to a cryptography service to retrieve algorithm
   * information for the specified components.
   * @param req A request containing PURL (Package URL) identifiers for components to scan.
   * @returns {AlgorithmResponse} A promise that resolves to an AlgorithmResponse containing detected cryptographic algorithms.
   */
  public async scan(req: PurlRequest):Promise<AlgorithmResponse> {
    const cryptographyService = new CryptographyService(
      this.config.API_KEY, // API KEY
      this.config.API_URL, // Destination Host
      this.config.GRPC_PROXY, // Proxy Host
      this.config.CA_CERT);
    const results:AlgorithmResponse = await cryptographyService.getAlgorithms(req);
    this.resultCollector.collectAlgorithmResults(results);
    return results;
  }
}
