import { CryptoAlgorithm } from '../CryptographyTypes';
import { CryptoItem } from '../Scanneable/CryptoItem';
import { IWorkerResponse, Worker } from './Worker';

export class ThreadPool {

  private readonly maxWorkers: number;

  private readonly workers: Array<Worker> = [];

  private readonly jobsQueue: any;

  private readonly cryptoRules: Map<string, RegExp>;

  private readonly cryptoMapper: Map<string, CryptoAlgorithm>;

  private results = [];

  private activeWorkers = 0;

  private resolve;

  private reject;
  constructor(maxWorkers = 3, rules:Map<string, RegExp>, cryptoMapper: Map<string, CryptoAlgorithm> ) {
    this.maxWorkers = maxWorkers;
    this.workers = [];
    this.jobsQueue = [];
    this.cryptoRules = rules;
    this.cryptoMapper = cryptoMapper;
  }

  enqueueTask(item: CryptoItem) {
    return new Promise((resolve, reject) => {
      const job = { item,  resolve, reject };
      this.jobsQueue.push(job);
    });
  }

  async init(): Promise<void> {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker();
      worker.on('message', async(item: IWorkerResponse) => {
        this.results.push(item.result);
        this.releaseWorker(item.id);
        await this.next();
      });

      // TODO: See what can be done in case an error on the thread
      worker.on('error', async (error) => {
        console.log(error);
        this.releaseWorker(worker.getId());
        await this.next();
      });

      this.workers.push(worker);
    }
  }

  private releaseWorker(id: number): number {
    const wId = this.workers.findIndex(w => w.getId() === id);
    const w = this.workers[wId];
    w.release();
    return w.getId();
  }

  private async next(){
    this.activeWorkers -= 1;
    if (this.activeWorkers === 0 && this.jobsQueue.length === 0) {
      await this.destroyAllWorkers();
      this.resolve(this.results);
    } else {
      this.processItem();
    }
  }

  private async destroyAllWorkers() {
    for (const worker of this.workers) {
      await worker.terminate(); // Terminate each worker
    }
  }

  async processQueue(): Promise<Array<CryptoItem>> {
    return new Promise(async(resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.processItem();
    });
  }

  private processItem() {
    if (this.workers.length > 0 && this.jobsQueue.length > 0) {
      const freeWorkerIndices = this.workers.reduce((indices, worker, index) => {
        if (worker.isFree()) {
          indices.push(index);
        }
        return indices;
      }, []);

      freeWorkerIndices.forEach(workerIndex => {
        if (this.jobsQueue.length <= 0) return;
        const { item, reject } = this.jobsQueue.shift();
        const worker = this.workers[workerIndex];
        worker.run({ item, rules: this.cryptoRules, cryptoMapper: this.cryptoMapper });
        this.activeWorkers += 1;
      });
    }
  }
}


