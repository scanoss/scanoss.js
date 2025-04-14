/**
 * Represents a configuration for cryptography scanner.
 */
export class CryptoCfg {

  private readonly DEFAULT_THREADS = 5;

   private readonly algorithmRulesPath: string;

   private readonly libraryRulesPath: string;

   private readonly threads: number;

  /**
   * Creates an instance of CryptoCfg.
   * @param {Object} cfg - Configuration object.
   * @param {number} [cfg.threads=5] - The number of threads to use. Defaults to 5 if not provided.
   * @param {string} [cfg.rulesPath] - Optional. Path to the cryptography rules file.
   */
   constructor( cfg: { threads: number, algorithmRulesPath: string, libraryRulesPath: string }) {
     this.algorithmRulesPath = cfg.algorithmRulesPath;
     this.libraryRulesPath = cfg.libraryRulesPath;
     this.threads = cfg.threads ? Number(cfg.threads) : this.DEFAULT_THREADS;
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


   public getNumberOfThreads(){
     return this.threads;
   }

}
