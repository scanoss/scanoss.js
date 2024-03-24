import { BaseConfig } from '../BaseConfig';
export class ScannerCfg extends BaseConfig {
    constructor() {
        super(...arguments);
        // Client Timestamp, default value is scanoss-js/${version}
        this.CLIENT_TIMESTAMP = '';
        // API URL
        this.API_URL = 'https://osskb.org/api/scan/direct';
        this.API_KEY = '';
        this.CA_CERT = '';
        //Set to true to ignore self certificates issues
        this.IGNORE_CERT_ERRORS = false;
        // Level of concurrency
        this.CONCURRENCY_LIMIT = 5;
        // Timeout for each transaction
        this.TIMEOUT = 180000;
        // The maximum size for each .wfp file in bytes
        this.WFP_FILE_MAX_SIZE = 32 * 1024;
        this.WFP_OBFUSCATION = false;
        this.RESULTS_DEOBFUSCATION = true;
        //After processing #WINNOWING_AFTER_X_REPORT_STATUS files,
        // the winnowing algorithm will report a ScannerEvents.WINNOWING_STATUS event.
        this.WINNOWING_REPORT_STATUS_AFTER_X = 10;
        this.MAX_RETRIES_FOR_RECOVERABLES_ERRORS = 6;
        this.ABORT_ON_MAX_RETRIES = true;
        // Persist results after [ X ] server responses
        this.MAX_RESPONSES_IN_BUFFER = 300;
        this.DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 2000;
        this.DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 1000;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Nhbm5lckNmZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZGsvc2Nhbm5lci9TY2FubmVyQ2ZnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsTUFBTSxPQUFPLFVBQVcsU0FBUSxVQUFVO0lBQTFDOztRQUNFLDJEQUEyRDtRQUNwRCxxQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDN0IsVUFBVTtRQUNILFlBQU8sR0FBRyxtQ0FBbUMsQ0FBQztRQUU5QyxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWIsWUFBTyxHQUFHLEVBQUUsQ0FBQztRQUVwQixnREFBZ0Q7UUFDekMsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBRWxDLHVCQUF1QjtRQUNoQixzQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFFN0IsK0JBQStCO1FBQ3hCLFlBQU8sR0FBRyxNQUFNLENBQUM7UUFFeEIsK0NBQStDO1FBQ3hDLHNCQUFpQixHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFOUIsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFFeEIsMEJBQXFCLEdBQUcsSUFBSSxDQUFDO1FBQ3BDLDBEQUEwRDtRQUMxRCw4RUFBOEU7UUFDdkUsb0NBQStCLEdBQUcsRUFBRSxDQUFDO1FBRXJDLHdDQUFtQyxHQUFHLENBQUMsQ0FBQztRQUV4Qyx5QkFBb0IsR0FBRyxJQUFJLENBQUM7UUFFbkMsK0NBQStDO1FBQ3hDLDRCQUF1QixHQUFHLEdBQUcsQ0FBQztRQUU5QixvQ0FBK0IsR0FBRyxJQUFJLENBQUM7UUFFdkMsb0NBQStCLEdBQUcsSUFBSSxDQUFDO0lBQ2hELENBQUM7Q0FBQSJ9