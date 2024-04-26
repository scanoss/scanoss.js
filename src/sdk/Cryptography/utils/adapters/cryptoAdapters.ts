import { CryptoItem } from '../../Scanneable/CryptoItem';
import { ICryptoItem, ILocalCryptographyResponse } from '../../CryptographyTypes';

/**
 * Maps an array of CryptoItem objects to an ILocalCryptographyResponse object.
 * @param ci An array of CryptoItem objects to map.
 * @returns An ILocalCryptographyResponse object containing mapped cryptographic items.
 */
export function mapToILocalCryptographyResponse(ci: Array<CryptoItem>): ILocalCryptographyResponse {
  const fileList: Array<ICryptoItem> = ci.map((c)=> ({  file: c.getPath(),  algorithms: c.getAlgorithms() }));
  return {
    fileList
  }
}
