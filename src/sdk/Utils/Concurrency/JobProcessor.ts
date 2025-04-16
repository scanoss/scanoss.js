import {Worker, isMainThread, parentPort} from 'worker_threads';
import {Job} from "./Job";
export const script = `
const { parentPort } = require ('worker_threads');

// Listen for messages from the parent thread
parentPort.on('message', (job) => {
    const result = 'Process from worker'
    const res = {
        filePath: job.data.filePath,
        hints: [],
    };
    parentPort.postMessage(res);
});

`;
export class JobProcessor<T> extends Worker {
    private isBusy = false;

    constructor(script: string) {
        super(script, {eval: true});

        // Set up default event listeners to manage busy state
        this.on('message', (result: any) => {
            this.isBusy = false;
        });

        this.on('error', (error) => {
            console.log("External handler received from worker:", error);
            this.isBusy = false;
        });

        this.on('exit', () => {
            this.isBusy = false;
        });
    }

    public processJob(job: Job<T>): void {
        if (this.isBusy) {
            throw new Error(`Job Processor ${this.threadId} is already busy`);
        }
        this.isBusy = true;
        // Send the task to the worker
        this.postMessage(job);
    }

    public getId(): number {
        return this.threadId;
    }

    public busy(): boolean {
        return this.isBusy;
    }
}
