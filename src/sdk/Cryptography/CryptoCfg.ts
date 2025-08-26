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

   constructor() {
     super();
     this.API_URL = 'https://api.scanoss.com';
   }
}
