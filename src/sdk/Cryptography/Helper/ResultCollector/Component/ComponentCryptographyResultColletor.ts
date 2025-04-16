import { CryptoAlgorithmResponse, CryptographyResponse, CryptoHintResponse
} from "../../../CryptographyTypes";
import {
  AlgorithmResponse, HintsResponse
} from "../../../../Services/Grpc/CryptographyService";

/**
 * Collects and organizes cryptographic scan results for software components.
 * This class maintains a mapping of component identifiers to their respective
 * algorithm and hint detection results.
 */
export class ComponentCryptographyResultCollector {

  private resultMapper = new Map<string,{
    purl: string;
    version: string;
    algorithms: Array<CryptoAlgorithmResponse>;
    hints: Array<CryptoHintResponse>;
  }>

  /**
   * Gets an existing result entry for a component or creates a new one if it doesn't exist.
   * @param purl The Package URL identifier for the component.
   * @param version The version of the component.
   * @returns The result entry for the specified component.
   */
  private getOrCreateResult(purl: string, version:string) {
    const key = `${purl}@${version}`;
    if (!this.resultMapper.has(key)) {
      this.resultMapper.set(key, {
        purl,
        version,
        algorithms: [],
        hints: []
      });
    }
    return this.resultMapper.get(key);
  }

  /**
   * Collects algorithm detection results and organizes them by component.
   * @param algorithmResults The algorithm detection results to collect.
   */
  public collectAlgorithmResults(algorithmResults: AlgorithmResponse):void {
    algorithmResults.purlsList.forEach((p) => {
      if (p.version) {
        const version = p.version.startsWith('v') ? p.version.slice(1) : p.version;
        const result = this.getOrCreateResult(p.purl,version);
        result.algorithms = p.algorithmsList;
      }
    });
  }

  /**
   * Collects hint detection results and organizes them by component.
   * @param hintResults The hint detection results to collect.
   */
  public collectHintResults(hintResults: HintsResponse):void {
    hintResults.purlsList.forEach((h) => {
      if (h.versionsList.length > 0) {
        const version = h.versionsList[0].startsWith('v') ? h.versionsList[0].slice(1) : h.versionsList[0];
        const result = this.getOrCreateResult(h.purl, version);
        result.hints = h.hintsList;
      }
    });
  }

  /**
   * Retrieves all collected cryptography results.
   * @returns An array of cryptography responses, one for each component.
   */
  public getResults():Array<CryptographyResponse> {
      return Array.from(this.resultMapper.values());
  }

}
