import EventEmitter from 'eventemitter3';
import os from 'os';
import fs from 'fs';
import { WfpCalculator } from './WfpProvider/WfpCalculator/WfpCalculator';
import path from 'path';
import { ScannerEvents } from './ScannerTypes';
import { ScannerCfg } from './ScannerCfg';
export class Fingerprint extends EventEmitter {
    constructor(reportStatusAfter = 10) {
        super();
        this.reportStatusAfter = reportStatusAfter;
        this.finishPromise = new Promise((resolve, reject) => {
            this.finishPromiseResolve = resolve;
            this.finishPromiseReject = reject;
        });
        this.configureWfpCalculator();
    }
    configureWfpCalculator() {
        // TODO: Maybe the fingerprints shouldn't be truncated. Determine this optimal value.
        const cfg = new ScannerCfg();
        cfg.WFP_FILE_MAX_SIZE = 10 * 1024 * 1024;
        cfg.WINNOWING_REPORT_STATUS_AFTER_X = this.reportStatusAfter;
        this.wfpCalculator = new WfpCalculator(cfg);
        this.wfpCalculator.on(ScannerEvents.WINNOWING_NEW_CONTENT, (fingerprintPackage) => {
            fs.appendFileSync(this.fingerprintPath, fingerprintPackage.getContent());
        });
        this.wfpCalculator.on(ScannerEvents.WINNOWING_STATUS, (filesProcessed) => {
            this.emit(ScannerEvents.WINNOWING_STATUS, filesProcessed);
        });
    }
    async start(jobs) {
        //If winnowing.wfp path is not set, set to a tmp folder
        if (!this.fingerprintPath)
            this.fingerprintPath = path.join(os.tmpdir(), "fingerprint-" + new Date().getTime().toString(), 'winnowing.wfp');
        //If folder does not exist, create
        const pathFolder = path.dirname(this.fingerprintPath);
        if (!fs.existsSync(pathFolder))
            fs.mkdirSync(pathFolder, { recursive: true });
        this.queue = jobs;
        for await (const job of this.queue) {
            this.configureWfpCalculator();
            await this.wfpCalculator.start(job);
        }
        this.emit(ScannerEvents.WINNOWING_FINISHED);
    }
    abort() {
        this.wfpCalculator.stop();
        this.wfpCalculator = null;
    }
    setFingerprintPath(fingerprintsFilePath) {
        this.fingerprintPath = fingerprintsFilePath;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmluZ2VycHJpbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2RrL3NjYW5uZXIvRmluZ2VycHJpbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFFcEIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQzFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUUxQyxNQUFNLE9BQU8sV0FBWSxTQUFRLFlBQVk7SUFRM0MsWUFBWSxpQkFBaUIsR0FBRyxFQUFFO1FBQ2hDLEtBQUssRUFBRSxDQUFDO1FBRVIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO1FBQzNDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLE9BQU8sQ0FBQztZQUNwQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUlPLHNCQUFzQjtRQUU1QixxRkFBcUY7UUFDckYsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUM3QixHQUFHLENBQUMsaUJBQWlCLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRSxJQUFJLENBQUM7UUFDeEMsR0FBRyxDQUFDLCtCQUErQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUM3RCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRzVDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLGtCQUFzQyxFQUFFLEVBQUU7WUFDcEcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxjQUFzQixFQUFFLEVBQUU7WUFDL0UsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7SUFHTCxDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUE4QjtRQUMvQyx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlO1lBQUUsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxjQUFjLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUU1SSxrQ0FBa0M7UUFDbEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEQsSUFBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO1lBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUU3RSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUVsQixJQUFJLEtBQUssRUFBRSxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzlCLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDckM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTSxLQUFLO1FBQ1YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsYUFBYSxHQUFDLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRU0sa0JBQWtCLENBQUMsb0JBQTRCO1FBQ3BELElBQUksQ0FBQyxlQUFlLEdBQUMsb0JBQW9CLENBQUM7SUFDNUMsQ0FBQztDQUlGIn0=