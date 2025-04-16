import { CryptoCfg } from "./CryptoCfg";
import {
  FileAlgorithmScanner
} from "./Algorithm/Files/FileAlgorithmScanner";
import { FileHintScanner } from "./Hint/Files/FileHintScanner";
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
  ComponentAlgorithmScanner
} from "./Algorithm/Components/ComponentAlgorithmScanner";
import {
  ComponentHintScanner
} from "./Hint/Components/ComponentHintScanner";


export class CryptographyScanner {

  private readonly config: CryptoCfg;

  constructor(cfg: CryptoCfg) {
    this.config = cfg;
  }

  public async scanFiles(files: Array<string>):Promise<LocalCryptographyResponse> {
    const cryptoResultCollector = new FileCryptographyResultCollector();
    const cryptoAlgorithmScanner = new FileAlgorithmScanner(this.config,cryptoResultCollector);
    const cryptoHintScanner = new FileHintScanner(this.config, cryptoResultCollector);
    await cryptoAlgorithmScanner.scan(files);
    await cryptoHintScanner.scan(files);
    return cryptoResultCollector.getResults();
  }

  public async scanComponents(req: PurlRequest):Promise<Array<CryptographyResponse>> {
    const componentCryptoResultCollector = new ComponentCryptographyResultCollector();
    const componentCryptoAlgorithmScanner = new ComponentAlgorithmScanner(this.config, componentCryptoResultCollector);
    const componentCryptoHintScanner = new ComponentHintScanner(this.config, componentCryptoResultCollector);
    await componentCryptoAlgorithmScanner.scan(req);
    await componentCryptoHintScanner.scan(req);
    return componentCryptoResultCollector.getResults();
  }
}
