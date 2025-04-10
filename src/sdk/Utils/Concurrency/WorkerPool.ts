import { JobProcessor } from "./JobProcessor";
import {Job} from "./Job";

export class WorkerPool<T, R> {
    private jobProcessors: Array<JobProcessor<T>> = new Array<JobProcessor<T>>();
    private jobs: Array<Job<T>> = [];
    private results = new Array<R>();
    private workerPromises = new Array<Promise<void>>;

    constructor(script: string,maxWorkers: number) {
        for(let i = 0; i < maxWorkers; i++) {
            this.jobProcessors.push(new JobProcessor(script));
        }
        this.init();
    }

    public loadJobs(jobs: Array<Job<T>>) {
        this.jobs = jobs;
    }

    private getNextJob(): Job<T> {
        return this.jobs.shift();
    }

    private async destroy(): Promise<void> {
        for(let j of this.jobProcessors){
            await j.terminate();
        }
    }

    private pendingWorkers() {
        let workersBusy = false;
        this.jobProcessors.forEach((j: JobProcessor<T>) => {
            if(j.busy()) { workersBusy = true };
        })
        return workersBusy;
    }

    private init(): void {
        for (let processor of this.jobProcessors) {
            this.workerPromises.push(new Promise<void>(resolve => {
                processor.on("message", async (data: R) => {
                    this.results.push(data);
                    const job = this.getNextJob();
                    if (job) {
                        processor.processJob(job);
                        return;
                    }
                    if(!this.pendingWorkers()){
                        await this.destroy();
                    }
                });
                processor.on("exit", (err) => {
                    resolve();
                })
            }));
        }
    }

    public async run(): Promise<Array<R>> {
        for (let processor of this.jobProcessors) {
            const job:Job<T> = this.getNextJob();
            if (job) {
                processor.processJob(job);
            }
        }
        await Promise.all(this.workerPromises);
        return this.results;
    }
}
