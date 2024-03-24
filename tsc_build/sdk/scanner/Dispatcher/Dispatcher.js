/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import EventEmitter from 'eventemitter3';
import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { ScannerEvents } from '../ScannerTypes';
import { DispatcherResponse } from './DispatcherResponse';
import { ScannerCfg } from '../ScannerCfg';
import { GlobalControllerAborter } from './GlobalControllerAborter';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import { Utils } from '../../Utils/Utils';
const MAX_CONCURRENT_REQUEST = 30;
var ERRORS;
(function (ERRORS) {
    ERRORS["HTTP"] = "HTTP";
    ERRORS["ABORT_CONTROLLER"] = "AbortError";
    ERRORS["TIMEOUT"] = "TIMEOUT";
})(ERRORS || (ERRORS = {}));
export class Dispatcher extends EventEmitter {
    constructor(scannerCfg = new ScannerCfg()) {
        super();
        this.scannerCfg = scannerCfg;
        if (this.scannerCfg.CONCURRENCY_LIMIT > MAX_CONCURRENT_REQUEST)
            this.scannerCfg.CONCURRENCY_LIMIT = MAX_CONCURRENT_REQUEST;
        this.init();
    }
    init() {
        //Loads proxy from SDK config, if not, loads from env variables, if not, leave empty
        this.proxyAgent = null;
        this.caCert = null;
        const proxyAddr = this.scannerCfg.PROXY ||
            process.env.https_proxy ||
            process.env.HTTPS_PROXY ||
            process.env.http_proxy ||
            process.env.HTTP_PROXY ||
            null;
        const caCertPath = this.scannerCfg.CA_CERT || process.env.NODE_EXTRA_CA_CERTS;
        if (caCertPath)
            Utils.loadCaCertFromFile(caCertPath);
        else if (this.scannerCfg.IGNORE_CERT_ERRORS || proxyAddr)
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        if (proxyAddr) {
            if (this.scannerCfg.API_URL.trim().startsWith('https'))
                this.proxyAgent = new HttpsProxyAgent(proxyAddr);
            else
                this.proxyAgent = new HttpProxyAgent(proxyAddr);
        }
        this.pQueue = new PQueue({
            concurrency: this.scannerCfg.CONCURRENCY_LIMIT,
        });
        this.pQueue.clear();
        this.pQueue.on('idle', () => {
            this.emit(ScannerEvents.DISPATCHER_FINISHED);
        });
        this.pQueue.on('next', () => {
            if (this.pQueue.size + this.pQueue.pending <
                this.scannerCfg.DISPATCHER_QUEUE_SIZE_MIN_LIMIT &&
                !this.queueMinLimitReached) {
                this.emit(ScannerEvents.DISPATCHER_QUEUE_SIZE_MIN_LIMIT);
                this.queueMinLimitReached = true;
                this.queueMaxLimitReached = false;
            }
        });
        this.queueMaxLimitReached = false;
        this.queueMinLimitReached = true;
        this.globalAbortController = new GlobalControllerAborter();
    }
    stop() {
        this.pQueue.clear();
        this.pQueue.pause();
        this.globalAbortController.abortAll();
    }
    dispatchItem(item) {
        this.pQueue.add(() => this.dispatch(item));
        if (this.pQueue.size + this.pQueue.pending >=
            this.scannerCfg.DISPATCHER_QUEUE_SIZE_MAX_LIMIT &&
            !this.queueMaxLimitReached) {
            this.emit(ScannerEvents.DISPATCHER_QUEUE_SIZE_MAX_LIMIT);
            this.queueMaxLimitReached = true;
            this.queueMinLimitReached = false;
        }
    }
    emitUnrecoberableError(error, disptItem, response) {
        this.emit('error', error, disptItem, response);
    }
    emitNoDispatchedItem(disptItem) {
        this.emit(ScannerEvents.DISPATCHER_LOG, `[ SCANNER ]: WFP content sended to many times`);
        this.emit(ScannerEvents.DISPATCHER_ITEM_NO_DISPATCHED, disptItem);
    }
    errorHandler(error, disptItem, response) {
        if (!this.globalAbortController.isAborting()) {
            //Abort scan when JSON is broken
            if (error instanceof SyntaxError) {
                this.emitUnrecoberableError(error, disptItem, response);
            }
            if (error.name === ERRORS.HTTP) {
                this.emitUnrecoberableError(error, disptItem, response);
            }
            //This is an error triggered by the AbortController
            if (error.name === ERRORS.ABORT_CONTROLLER) {
                error = new Error(`Timeout reached for packet with request ID ${disptItem.uuid}`);
                error.name = ERRORS.TIMEOUT;
            }
            disptItem.increaseErrorCounter();
            if (disptItem.getErrorCounter() >=
                this.scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS) {
                this.emitNoDispatchedItem(disptItem);
                if (this.scannerCfg.ABORT_ON_MAX_RETRIES) {
                    error['max_retries'] = `Fingerprint block retried ${this.scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS} times, aborting`;
                    this.emitUnrecoberableError(error, disptItem, response);
                }
                return;
            }
            this.emit(ScannerEvents.DISPATCHER_LOG, `[ SCANNER ]: An error occurred while sending WFP content to the server. Reason: ${error}`);
            this.dispatchItem(disptItem);
            return;
        }
    }
    async dispatch(item) {
        const timeoutController = this.globalAbortController.getAbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), this.scannerCfg.TIMEOUT);
        let plain_response;
        try {
            this.emit(ScannerEvents.DISPATCHER_WFP_SENDED);
            const response = await fetch(this.scannerCfg.API_URL, {
                agent: this.proxyAgent,
                method: 'post',
                body: item.getForm(),
                headers: {
                    'User-Agent': this.scannerCfg.CLIENT_TIMESTAMP
                        ? this.scannerCfg.CLIENT_TIMESTAMP
                        : `scanoss-js/v${Utils.getPackageVersion()}`,
                    'X-Session': this.scannerCfg.API_KEY,
                    'x-request-id': item.uuid,
                },
                signal: timeoutController.signal,
            });
            clearTimeout(timeoutId);
            this.globalAbortController.removeAbortController(timeoutController);
            if (!response.ok) {
                plain_response = await response.text();
                const err = new Error(`\nHTTP Status code: ${response.status}\nServer Response:\n${plain_response}\n`);
                err.name = ERRORS.HTTP;
                throw err;
            }
            plain_response = await response.text();
            const dataAsObj = JSON.parse(plain_response);
            const dispatcherResponse = new DispatcherResponse(dataAsObj, item.getFingerprintPackage().getContent());
            this.emit(ScannerEvents.DISPATCHER_NEW_DATA, dispatcherResponse);
            return Promise.resolve();
        }
        catch (e) {
            clearTimeout(timeoutId);
            this.globalAbortController.removeAbortController(timeoutController);
            this.errorHandler(e, item, plain_response);
            return Promise.resolve();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZGsvc2Nhbm5lci9EaXNwYXRjaGVyL0Rpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsaUNBQWlDO0FBQ2pDLHlDQUF5QztBQUN6QyxPQUFPLFlBQVksTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxLQUFtQixNQUFNLFlBQVksQ0FBQztBQUM3QyxPQUFPLE1BQU0sTUFBTSxTQUFTLENBQUM7QUFFN0IsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFcEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFMUMsTUFBTSxzQkFBc0IsR0FBRyxFQUFFLENBQUM7QUFFbEMsSUFBSyxNQUlKO0FBSkQsV0FBSyxNQUFNO0lBQ1QsdUJBQWEsQ0FBQTtJQUNiLHlDQUErQixDQUFBO0lBQy9CLDZCQUFtQixDQUFBO0FBQ3JCLENBQUMsRUFKSSxNQUFNLEtBQU4sTUFBTSxRQUlWO0FBRUQsTUFBTSxPQUFPLFVBQVcsU0FBUSxZQUFZO0lBaUIxQyxZQUFZLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRTtRQUN2QyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsR0FBRyxzQkFBc0I7WUFDNUQsSUFBSSxD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