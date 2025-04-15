import { CryptoCfg } from "./CryptoCfg";
import {
  FileCryptographyAlgorithmScanner
} from "./Algorithm/Files/FileCryptographyAlgorithmScanner";
import { FileCryptographyHintScanner } from "./Hint/Files/CryptographyHintsScanner";
import {
  CryptographyResponse,
  LocalCryptographyResponse
} from "./CryptographyTypes";
import { PurlRequest } from "../Services/Grpc/BaseService";
import {
  FileCryptographyResultCollector
} from "./Helper/ResultCollector/File/FileCryptographyResultCollector";
import {
  ComponentCryptographyResultCollector
} from "./Helper/ResultCollector/Component/ComponentCryptographyResultColletor";
import {
  ComponentCryptographyAlgorithmScanner
} from "./Algorithm/Components/ComponentCryptographyAlgorithmScanner";
import {
  ComponentCryptographyHintScanner
} from "./Hint/Components/ComponentCryptographyHintScanner";


export class CryptographyScanner {

  private readonly config: CryptoCfg;

  constructor(cfg: CryptoCfg) {
    this.config = cfg;
  }

  public async scanFiles(files: Array<string>):Promise<LocalCryptographyResponse> {
    const cryptoResultCollector = new FileCryptographyResultCollector();
    const cryptoAlgorithmScanner = new FileCryptographyAlgorithmScanner(this.config,cryptoResultCollector);
    const cryptoHintScanner = new FileCryptographyHintScanner(this.config, cryptoResultCollector);
    await cryptoAlgorithmScanner.scan(files);
    await cryptoHintScanner.scan(files);
    return cryptoResultCollector.getResults();
  }

  public async scanComponents(req: PurlRequest):Promise<Array<CryptographyResponse>> {
    const componentCryptoResultCollector = new ComponentCryptographyResultCollector();
    const componentCryptoAlgorithmScanner = new ComponentCryptographyAlgorithmScanner(this.config, componentCryptoResultCollector);
    const componentCryptoHintScanner = new ComponentCryptographyHintScanner(this.config, componentCryptoResultCollector);
    await componentCryptoAlgorithmScanner.scan(req);
    await componentCryptoHintScanner.scan(req);
    return componentCryptoResultCollector.getResults();
  }
}
