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
    requirement: string;
    algorithms: Array<CryptoAlgorithmResponse>;
    hints: Array<CryptoHintResponse>;
  }>

  /**
   * Gets an existing result entry for a component or creates a new one if it doesn't exist.
   * @param purl The Package URL identifier for the component.
   * @param version The version of the component.
   * @param requirement The version requirement for the component.
   * @returns The result entry for the specified component.
   */
  private getOrCreateResult(purl: string, version:string, requirement: string) {
    const key = `${purl}@${requirement}`;
    if (!this.resultMapper.has(key)) {
      this.resultMapper.set(key, {
        purl,
        version,
        requirement,
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
      if (c.requirement) {
        const result = this.getOrCreateResult(c.purl,c.version, c.requirement);
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
      const result = this.getOrCreateResult(c.purl,c.version,c.requirement);
      result.hints = c.hints;
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
