import {
  CryptoAlgorithm,
  CryptoAlgorithmRules,
  LocalCryptoAlgorithm
} from "../../../CryptographyTypes";

/**
 * Function to create a mapping of regular expressions based on provided crypto definitions.
 * @param cryptoRulesDefinitions An array of objects containing cryptographic definitions.
 * @returns A Map where each key is a cryptographic algorithm and each value is a regular expression
 *          that matches keywords associated with that algorithm.
 */
export function createCryptoKeywordMapper(cryptoRulesDefinitions: Array<CryptoAlgorithmRules>): Map<string, RegExp> {
  const mapper = new Map<string,RegExp>();
  cryptoRulesDefinitions.forEach(c=> {
   // Skips those rules with empty keywords
    if(c.keywords.length > 0) {
      const words = [];
      c.keywords.forEach((k) => {
        const escapedWord = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        words.push(escapedWord);
      });
      mapper.set(c?.algorithmId ? c?.algorithmId : c.algorithm, new RegExp(words.join('|'), 'gi'));
    }
  });
  return mapper;
}

/**
 * Function to create a mapping of cryptographic algorithms and their strengths.
 * @param cryptoDefinitions An array of objects containing cryptographic definitions.
 * @returns A Map where each key is a cryptographic algorithm and each value is an object
 *          containing the algorithm's name and strength.
 */
export function getCryptoMapper(cryptoDefinitions: Array<CryptoAlgorithmRules>): Map<string, CryptoAlgorithm> {
   const cryptoMapper = new Map<string, CryptoAlgorithm>();
   cryptoDefinitions.forEach((c) => {
    const { algorithm, strength , algorithmId } = c;
    // Add the algorithm and its details to the map.
    cryptoMapper.set(c?.algorithmId ? c?.algorithmId : c.algorithm , { algorithm: algorithmId? algorithmId: algorithm , strength });
  });
  return cryptoMapper;
}



