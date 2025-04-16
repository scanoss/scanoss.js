import {
  ComponentCryptographyResultCollector
} from "../../Helper/ResultCollector/Component/ComponentCryptographyResultColletor";
import {
  AlgorithmResponse,
  CryptographyService
} from "../../../Services/Grpc/CryptographyService";
import { PurlRequest } from "../../../Services/Grpc/BaseService";
import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";

export class ComponentAlgorithmScanner
  extends BaseCryptographyScanner<
    ComponentCryptographyResultCollector,
    PurlRequest,
    AlgorithmResponse>{

  public async scan(req: PurlRequest):Promise<AlgorithmResponse> {
    const cryptographyService = new CryptographyService(this.config.getApikey(), this.config.getProxy());
    const results = await cryptographyService.getAlgorithms(req);
    this.resultCollector.collectAlgorithmResults(results);
    return results;
  }
}
