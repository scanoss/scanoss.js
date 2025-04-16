import { CryptoAlgorithm } from '../../../CryptographyTypes';

/**
 * Represents a cryptographic item containing information about a file and cryptographic algorithms found in it.
 */
export class CryptoItem {

  file: string;
  algorithms: Array<CryptoAlgorithm>;

  /**
   * Constructs a new CryptoItem with the specified file path.
   * @param file The path to the file.
   */
  constructor(file: string) {
    this.file = file;
    this.algorithms = [];
  }

  /**
   * Retrieves the path to the file.
   * @returns The path to the file.
   */
  public getPath(){
    return this.file;
  }

  /**
   * Retrieves the cryptographic algorithms found in the file.
   * @returns An array of cryptographic algorithms.
   */
  public getAlgorithms(){
    return this.algorithms;
  }

  /**
   * Sets the cryptographic algorithms found in the file.
   * @param algorithms An array of cryptographic algorithms.
   */
  public setAlgorithms(algorithms: Array<CryptoAlgorithm>){
    this.algorithms = algorithms;
  }

}
