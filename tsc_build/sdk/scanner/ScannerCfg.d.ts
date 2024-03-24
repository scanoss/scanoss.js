import { BaseConfig } from '../BaseConfig';
export declare class ScannerCfg extends BaseConfig {
    CLIENT_TIMESTAMP: string;
    API_URL: string;
    API_KEY: string;
    CA_CERT: string;
    IGNORE_CERT_ERRORS: boolean;
    CONCURRENCY_LIMIT: number;
    TIMEOUT: number;
    WFP_FILE_MAX_SIZE: number;
    WFP_OBFUSCATION: boolean;
    RESULTS_DEOBFUSCATION: boolean;
    WINNOWING_REPORT_STATUS_AFTER_X: number;
    MAX_RETRIES_FOR_RECOVERABLES_ERRORS: number;
    ABORT_ON_MAX_RETRIES: boolean;
    MAX_RESPONSES_IN_BUFFER: number;
    DISPATCHER_QUEUE_SIZE_MAX_LIMIT: number;
    DISPATCHER_QUEUE_SIZE_MIN_LIMIT: number;
}
