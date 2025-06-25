import { BaseConfig, IBaseConfig } from "../BaseConfig";
const DEFAULT_CHUNK_REQUEST_SIZE = 15;

export interface IDependencyScannerCfg  extends IBaseConfig {
  CHUNK_REQUEST_SIZE?: number;
}

export class DependencyScannerCfg extends BaseConfig {
  private _CHUNK_REQUEST_SIZE = DEFAULT_CHUNK_REQUEST_SIZE;
  constructor(config?: IDependencyScannerCfg) {
    super(config);
    if(config){
      this.CHUNK_REQUEST_SIZE = config.CHUNK_REQUEST_SIZE ? config.CHUNK_REQUEST_SIZE : DEFAULT_CHUNK_REQUEST_SIZE;
    }
  }

  get CHUNK_REQUEST_SIZE(): number {
    return this._CHUNK_REQUEST_SIZE;
  }

  set CHUNK_REQUEST_SIZE(value: number) {
    this._CHUNK_REQUEST_SIZE = value;
  }

}
