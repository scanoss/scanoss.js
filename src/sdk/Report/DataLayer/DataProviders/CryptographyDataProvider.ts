import {
  ComponentCryptography, CryptographyData,
  DataProvider,
  IDataLayers
} from "../DataLayerTypes";
import {
  ScannerComponent,
} from '../../../scanner/ScannerTypes';
import {
  CryptoAlgorithm, CryptographyResponse, LocalCryptography
} from "../../../Cryptography/CryptographyTypes";


export class CryptographyDataProvider implements DataProvider {
  private localCrypto: Array<LocalCryptography>;
  private componentCryptography: Array<CryptographyResponse>;
  constructor(localCrypto: Array<LocalCryptography>, componentCryptography: Array<CryptographyResponse>) {
    this.localCrypto = localCrypto;
    this.componentCryptography = componentCryptography;
  }


  private getComponentCryptographyData(){
    const cryptographyData: Array<CryptographyData> = [];
    const cryptographyMapper = new Map<string,{ source:string, type: string, values: Set<string> }>();
    this.componentCryptography.forEach((c)=>{
      const source = `${c.purl}@${c.version}`;
      // Algorithms
      c.algorithms.forEach((a)=>{
        const key = `${source}@algorithm`;
        if(cryptographyMapper.has(key)){
          cryptographyMapper.get(key).values.add(a.algorithm);
        }else{
          cryptographyMapper.set(key, { source, type:'algorithm', values: new Set<string>([a.algorithm]) })
        }
      });

      // Hints
      c.hints.forEach((h)=>{
        const key = `${source}@${h.category}`;
        if(cryptographyMapper.has(key)){
          cryptographyMapper.get(key).values.add(h.id);
        }else{
          cryptographyMapper.set(key, { source, type:h.category, values: new Set<string>([h.id]) })
        }
      });
    });

    // Convert set values to array
    cryptographyMapper.forEach((c)=>{
      cryptographyData.push({...c, values: Array.from(c.values)})
    })
    return cryptographyData;
  }

  private getLocalCryptographyData(){
    const fileCryptographyData: Array<CryptographyData> = [];
    const fileCryptographyMapper = new Map<string,{ source:string, type: string, values: Set<string> }>();
    this.localCrypto.forEach((c)=>{
      // Algorithms
      c.algorithms.forEach((a)=>{
        const key = `${c.file}@algorithm`;
        if(fileCryptographyMapper.has(key)){
          fileCryptographyMapper.get(key).values.add(a.algorithm);
        }else{
          fileCryptographyMapper.set(key, { source: c.file, type:'algorithm', values: new Set<string>([a.algorithm]) })
        }
      });

      // Hints
      c.hints.forEach((h)=>{
        const key = `${c.file}@${h.category}`;
        if(fileCryptographyMapper.has(key)){
          fileCryptographyMapper.get(key).values.add(h.id);
        }else{
          fileCryptographyMapper.set(key, { source: c.file, type:h.category, values: new Set<string>([h.id]) })
        }
      });
    });

    // Convert set values to array
    fileCryptographyMapper.forEach((c)=>{
      fileCryptographyData.push({...c, values: Array.from(c.values)})
    })
    return fileCryptographyData;
  }

  async getData():Promise<IDataLayers> {

    if(!this.localCrypto && !this.componentCryptography) return <IDataLayers>{ cryptography: null }

   return <IDataLayers>{
      cryptography:{
        files: this.getLocalCryptographyData(),
        components: this.getComponentCryptographyData(),
      }
   }
  }

  private getCrypto(scanComponents: Array<ScannerComponent>):Array<ComponentCryptography> {
    const componentCrypto = [];
    scanComponents.forEach((c)=>{
        if(c.cryptography && c.cryptography.length > 0){
          const crypto = {
            purl: c.purl,
            version: c.version,
            algorithms: c.cryptography
          }
          componentCrypto.push(crypto);
        }
    });
    return this.normalizeAlgorithms(componentCrypto)
  }

  private normalizeAlgorithms(crypto: Array<ComponentCryptography>):Array<ComponentCryptography> {
    crypto.forEach((c)=>{
      c.algorithms = this.removeRepeatedAlgorithms(c.algorithms);
    })

    return crypto;

  }

  private removeRepeatedAlgorithms(algorithms: Array<CryptoAlgorithm>):Array<CryptoAlgorithm> {
    const algorithmsMapper = new Map<string, { algorithm: string, strength: string }>();
    algorithms.forEach((a) => {
      const algorithmToLowerCase = a.algorithm.toLowerCase();
      algorithmsMapper.set(algorithmToLowerCase, {...a, algorithm: algorithmToLowerCase})
    });
    return Array.from(algorithmsMapper.values());
  }

  getLayerName(): string {
    return '';
  }
}
