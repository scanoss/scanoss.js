import { BaseConfig, IBaseConfig } from "../BaseConfig";

export class DependencyScannerCfg extends BaseConfig {
  constructor(config?: IBaseConfig) {
    super(config);
    this.API_URL = 'https://api.scanoss.com';
  }
}
