import {
  ComponentCryptographyResultCollector
} from "../../Helper/ResultCollector/Component/ComponentCryptographyResultColletor";
import { PurlRequest } from "../../../Services/Grpc/BaseService";
import { CryptographyService,
  HintsResponse } from "../../../Services/Grpc/CryptographyService";
import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";

export class ComponentHintScanner
  extends BaseCryptographyScanner<
    ComponentCryptographyResultCollector,
    PurlRequest,
    HintsResponse>{

  public async scan(req: PurlRequest):Promise<HintsResponse>{
    const cryptographyService = new CryptographyService(this.config.getApikey(), this.config.getProxy());
    const results = await cryptographyService.getEncryptionHints(req);
    this.resultCollector.collectHintResults(results);
    return results;
  }
}
