import { CryptoAlgorithmResponse, CryptographyResponse, CryptoHintResponse
} from "../../../CryptographyTypes";
import {
  AlgorithmResponse, HintsResponse
} from "../../../../Services/Grpc/CryptographyService";

export class ComponentCryptographyResultCollector {

  private resultMapper = new Map<string,{
    purl: string;
    version: string;
    algorithms: Array<CryptoAlgorithmResponse>;
    hints: Array<CryptoHintResponse>;
  }>

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

  public collectAlgorithmResults(algorithmResults: AlgorithmResponse){
    algorithmResults.purlsList.forEach((p) => {
      if (p.version) {
        const version = p.version.startsWith('v') ? p.version.slice(1) : p.version;
        const result = this.getOrCreateResult(p.purl,version);
        result.algorithms = p.algorithmsList;
      }
    });
  }

  public collectHintResults(hintResults: HintsResponse){
    hintResults.purlsList.forEach((h) => {
      if (h.versionsList.length > 0) {
        const version = h.versionsList[0].startsWith('v') ? h.versionsList[0].slice(1) : h.versionsList[0];
        const result = this.getOrCreateResult(h.purl, version);
        result.hints = h.hintsList;
      }
    });
  }

  public getResults():Array<CryptographyResponse> {
      return Array.from(this.resultMapper.values());
  }

}
