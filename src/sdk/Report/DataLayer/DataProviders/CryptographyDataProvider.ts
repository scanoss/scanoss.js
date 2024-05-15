import {
  ComponentCryptography,
  DataProvider,
  IDataLayers
} from '../DataLayerTypes';
import {
  ScannerComponent,
  ScannerResults
} from '../../../scanner/ScannerTypes';
import { IDependencyResponse } from '../../../Dependencies/DependencyTypes';
import {
  CryptoAlgorithm,
  ICryptoItem
} from '../../../Cryptography/CryptographyTypes';

export class CryptographyDataProvider implements DataProvider {
  private files: Array<ICryptoItem>;
  private scanRawResults: ScannerResults;
  private componentList: Array<ScannerComponent>;
  constructor(files: Array<ICryptoItem>,   scanRawResults: ScannerResults,) {
    this.files = files;
    this.scanRawResults = scanRawResults;
  }
  async getData():Promise<IDataLayers> {

    if(!this.files && !this.scanRawResults) return <IDataLayers>{ cryptography: null }

    this.componentList = Object.values(this.scanRawResults).flat();
    this.componentList = this.componentList.filter(
      (component) => component.id !== 'none'
    );

    const componentCryptography = this.getCrypto(this.componentList);

   return <IDataLayers>{
      cryptography:{
        files: this.files,
        components: componentCryptography,
      }
   }
  }

  private getCrypto(scanComponents: Array<ScannerComponent>):Array<ComponentCryptography> {
    const componentCrypto = [];
    scanComponents.forEach((c)=>{
        if(c.cryptography.length > 0){
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
