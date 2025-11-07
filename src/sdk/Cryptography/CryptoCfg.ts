import { BaseConfig } from "../BaseConfig";

/**
 * Represents a configuration for cryptography scanner.
 */
export class CryptoCfg extends BaseConfig {

   private readonly DEFAULT_THREADS = 5;

   ALGORITHM_RULES_PATH: string;

   LIBRARY_RULES_PATH: string;

   THREADS: number = this.DEFAULT_THREADS;

   API_KEY: string = '';

   constructor(cfg?: CryptoCfg) {
     super(cfg);
     if(cfg) {
       this.API_KEY = cfg.API_KEY ? cfg.API_KEY : '';
     }
   }

   public get API_URL(): string{
     return this.resolveApiUrl(this.API_KEY, super.API_URL);
   }

   public set API_URL(value: string) {
     super.API_URL = value;
   }

}
