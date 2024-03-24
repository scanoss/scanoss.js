import * as DependenciesMessages from './scanoss/api/dependencies/v2/scanoss-dependencies_pb';
import * as CommonMessages from './scanoss/api/common/v2/scanoss-common_pb';
export declare class DependencyService {
    private client;
    private metadata;
    constructor(endpoint: string, proxy?: string);
    get(req: DependenciesMessages.DependencyRequest): Promise<DependenciesMessages.DependencyResponse>;
    buildDependencyRequestMsg(plainObj: DependenciesMessages.DependencyRequest.AsObject): DependenciesMessages.DependencyRequest;
    echo(req: CommonMessages.EchoRequest): Promise<CommonMessages.EchoResponse>;
    buildEchoRequestMsg(plainObj: CommonMessages.EchoRequest.AsObject): CommonMessages.EchoRequest;
}
