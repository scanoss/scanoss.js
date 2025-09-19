import {
  CryptoAlgorithmResponse,
  CryptographyResponse,
  CryptoHintResponse
} from "../../../CryptographyTypes";
import { AlgorithmResponse, HintsInRangeResponse } from "../../../../Clients/Cryptography/ICryptographyClient";

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
    algorithmResults.components.forEach((c) => {
      if (c.version) {
        const version = c.version.startsWith('v') ? c.version.slice(1) : c.version;
        const result = this.getOrCreateResult(c.purl,version);
        result.algorithms = c.algorithms;
      }
    });
  }

  /**
   * Collects hint detection results and organizes them by component.
   * @param hintResults The hint detection results to collect.
   */
  public collectHintResults(hintResults: HintsInRangeResponse):void {
    hintResults.components.forEach((c) => {
      if (c.versions.length > 0) {
        const version = c.versions[0].startsWith('v') ? c.versions[0].slice(1) : c.versions[0];
        const result = this.getOrCreateResult(c.purl, version);
        result.hints = c.hints;
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
