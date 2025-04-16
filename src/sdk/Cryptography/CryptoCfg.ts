/**
 * Represents a configuration for cryptography scanner.
 */
export class CryptoCfg {

  private readonly DEFAULT_THREADS = 5;

   private readonly algorithmRulesPath: string;

   private readonly libraryRulesPath: string;

   private readonly threads: number;

   protected readonly apiKey: string;

   protected readonly proxy : string;

  /**
   * Creates an instance of CryptoCfg.
   * @param {Object} cfg - Configuration object.
   * @param {number} [cfg.threads=5] - The number of threads to use. Defaults to 5 if not provided.
   * @param {string} [cfg.rulesPath] - Optional. Path to the cryptography rules file.
   * @param {string} [cfg.apiKey] - Optional. SCANOSS API Key.
   * @param {string} [cfg.proxy] - Optional. proxy.
   */
   constructor( cfg: { threads?: number, algorithmRulesPath?: string, libraryRulesPath?: string , apiKey?: string, proxy ?: string }) {
     this.algorithmRulesPath = cfg.algorithmRulesPath;
     this.libraryRulesPath = cfg.libraryRulesPath;
     this.threads = cfg.threads ? Number(cfg.threads) : this.DEFAULT_THREADS;
     this.apiKey = cfg.apiKey;
     this.proxy = cfg.proxy;
   }

  /**
   * Gets the path to the cryptography algorithm rules file.
   * @returns The path to the cryptography rules file.
   */
   public getAlgorithmRulesPath(): string {
     return this.algorithmRulesPath;
   }

  /**
  * Gets the path to the cryptography library rules file.
  * @returns The path to the cryptography rules file.
  */
  public getLibraryRulesPath(): string {
    return this.libraryRulesPath;
  }

  /**
  * Gets the number of threads to use on local crypto detection.
  * @returns The number of threads.
  **/
  public getNumberOfThreads(){
    return this.threads;
  }

  /**
  * Gets the API Key set.
  * @returns The API Key.
  **/
  public getApikey(): string {
    return this.apiKey;
  }

  /**
  * Gets proxy.
  * @returns proxy.
  **/
  public getProxy(): string {
    return this.proxy;
  }

}
