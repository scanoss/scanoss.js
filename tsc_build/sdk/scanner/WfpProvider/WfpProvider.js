import EventEmitter from 'eventemitter3';
import { ScannerEvents, WinnowingMode } from '../ScannerTypes';
import { FingerprintPackage } from './FingerprintPackage';
export class WfpProvider extends EventEmitter {
    hasPendingFiles() {
        return this.pendingFiles;
    }
    init() {
        this.wfp = '';
        this.folderRoot = '';
        this.pendingFiles = false;
        this.winnowingMode = WinnowingMode.FULL_WINNOWING;
        this.obfuscate = false;
        this.finishPromise = new Promise((resolve, reject) => {
            this.finishPromiseResolve = resolve;
            this.finishPromiseReject = reject;
        });
    }
    // returns true if the function emitted a new fingerprint packet
    fingerprintPacker(fingerprint) {
        // When the fingerprint of one file is bigger than 64Kb, truncate to the last 64Kb line.
        if (fingerprint.length > this.scannerCfg.WFP_FILE_MAX_SIZE) {
            let truncateStringOnIndex = this.scannerCfg.WFP_FILE_MAX_SIZE;
            let keepRemovingCharacters = true;
            while (keepRemovingCharacters) {
                if (fingerprint[truncateStringOnIndex] === '\n')
                    keepRemovingCharacters = false;
                truncateStringOnIndex -= 1;
            }
            truncateStringOnIndex += 1;
            // eslint-disable-next-line no-param-reassign
            fingerprint = fingerprint.substring(0, truncateStringOnIndex);
            // eslint-disable-next-line no-param-reassign
            fingerprint += '\n';
        }
        const conditionMaxSize = this.wfp.length + fingerprint.length >= this.scannerCfg.WFP_FILE_MAX_SIZE;
        const conditionMaxFiles = (this.wfp.match(/file\=/g) || []).length >=
            Math.round(this.scannerCfg.WFP_FILE_MAX_SIZE / 1024);
        if ((conditionMaxSize || conditionMaxFiles) && this.wfp.length > 0) {
            this.sendFingerprint(new FingerprintPackage(this.wfp, this.folderRoot));
            this.wfp = '';
        }
        this.wfp += fingerprint;
        if (this.wfp !== fingerprint)
            return false;
        return true;
    }
    finishWinnowing() {
        if (this.wfp.length !== 0)
            this.sendFingerprint(new FingerprintPackage(this.wfp, this.folderRoot));
        this.pendingFiles = false;
        this.emit(ScannerEvents.WINNOWING_FINISHED);
        this.finishPromiseResolve();
    }
    sendFingerprint(fingerprintPackage) {
        if (this.obfuscate)
            fingerprintPackage.obfuscate();
        this.emit(ScannerEvents.WINNOWING_NEW_CONTENT, fingerprintPackage);
    }
    sendLog(logMsg) {
        this.emit(ScannerEvents.WINNOWER_LOG, logMsg);
    }
    sendError(errorMsg) {
        this.emit(ScannerEvents.ERROR, new Error(errorMsg));
        this.finishPromiseReject();
    }
    setWinnowingMode(mode) {
        this.winnowingMode = mode;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ZwUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2RrL3NjYW5uZXIvV2ZwUHJvdmlkZXIvV2ZwUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFVMUQsTUFBTSxPQUFnQixXQUFZLFNBQVEsWUFBWTtJQXNCN0MsZUFBZTtRQUNwQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVTLElBQUk7UUFDWixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQztRQUNsRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUV2QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25ELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxPQUFPLENBQUM7WUFDcEMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxnRUFBZ0U7SUFDdEQsaUJBQWlCLENBQUMsV0FBbUI7UUFDN0Msd0ZBQXdGO1FBQ3hGLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFO1lBQzFELElBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FB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