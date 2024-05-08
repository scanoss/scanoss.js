import { TransferListItem, Worker as W, WorkerOptions } from 'worker_threads';
import { URL } from 'node:url';
import { CryptoItem } from '../Scanneable/CryptoItem';

const stringWorker = `
const { parentPort } = require('worker_threads');
const fs = require('fs');

parentPort.on('message', async (data) => {

    const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

    const { item, rules , cryptoMapper, id } = data;

     const cryptoFound = new Array();
     const stats = await fs.promises.stat(item.file);
     if (stats.size > MAX_FILE_SIZE) {
      item.algorithms = [];
      parentPort.postMessage({ result: item, id });
      return;
     }

      let content =  fs.readFileSync(item.file, 'utf-8');
       rules.forEach((value, key) => {
      try {
        const matches = content.match(value);
        if (matches) {
          cryptoFound.push(key);
        }
      } catch (e){
        console.error(e);
      }
    });
    const results = [];
    cryptoFound.forEach((cf)=>{
      results.push(cryptoMapper.get(cf));
    });
    item.algorithms = results;
    parentPort.postMessage({ result: item, id });
  });
`;

export interface IWorkerResponse {
  result: CryptoItem;
  id: number;
}

export class Worker extends W {

  private free: boolean ;


  constructor() {
    super(stringWorker, { eval: true });
    this.free = true;
  }

  public getId(): number {
    return this.threadId;
  }

  public release(){
    this.free = true;
  }

  public isFree(): boolean {
    return this.free;
  }

  on(event, listener) {
    if (event === 'error') {
      this.free = true;
    }
    // Call super.on with the provided arguments
     return super.on(event, listener);

  }
  public run (value: any, transferList?: ReadonlyArray<TransferListItem>){
    this.free = false;
    this.postMessage({...value, id: this.threadId });
  }

}
