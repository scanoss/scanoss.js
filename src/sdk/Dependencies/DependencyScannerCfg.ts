import { BaseConfig } from "../BaseConfig";
const DEFAULT_CHUNK_REQUEST_SIZE = 15;

export class DependencyScannerCfg extends BaseConfig {

  _API_KEY: string = '';

  _CHUNK_REQUEST_SIZE = DEFAULT_CHUNK_REQUEST_SIZE;
  constructor(config?: DependencyScannerCfg) {
    super(config);
    if(config){
      this.CHUNK_REQUEST_SIZE = config.CHUNK_REQUEST_SIZE ? config.CHUNK_REQUEST_SIZE : DEFAULT_CHUNK_REQUEST_SIZE;
      this.API_KEY =  config.API_KEY ? config.API_KEY : '';
    }
  }

  get CHUNK_REQUEST_SIZE(): number {
    return this._CHUNK_REQUEST_SIZE;
  }

  set CHUNK_REQUEST_SIZE(value: number) {
    this._CHUNK_REQUEST_SIZE = value;
  }

  get API_KEY(): string{
    return this._API_KEY;
  }

  set API_KEY(value: string){
    this._API_KEY = value;
  }

  get API_URL(): string {
    return this.resolveApiUrl(this.API_KEY, super.API_URL);
  }

  set API_URL(url: string) {
    super.API_URL = url;
  }

}
