/**
 * Represents a configuration for cryptography scanner.
 */
export class CryptoCfg {

   private readonly rulesPath: string;

  /**
   * Creates an instance of CryptoCfg.
   * @param rulesPath Optional. Path to the cryptography rules file.
   */
   constructor(rulesPath?: string) {
     this.rulesPath = rulesPath;
   }

  /**
   * Gets the path to the cryptography rules file.
   * @returns The path to the cryptography rules file.
   */
   public getRulesPath(): string {
     return this.rulesPath;
   }

}
