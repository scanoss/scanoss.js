import * as CryptographyMessages from './scanoss/api/cryptography/v2/scanoss-cryptography_pb';
import { BaseService, PurlRequest } from './BaseService';
export interface AlgorithmResponse extends CryptographyMessages.AlgorithmResponse.AsObject {
}
export declare class CryptographyService extends BaseService {
    private client;
    constructor(token: string, proxy?: string);
    getAlgorithms(req: PurlRequest): Promise<AlgorithmResponse>;
}
