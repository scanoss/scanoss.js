import { BaseConfig } from "../BaseConfig";

export class DependencyScannerCfg extends BaseConfig {
  constructor(config?: DependencyScannerCfg) {
    super(config);
    this.API_URL = 'https://api.scanoss.com';
  }
}
