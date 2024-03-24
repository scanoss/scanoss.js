export namespace CryptographyService {
    namespace echo {
        export const path: string;
        export const requestStream: boolean;
        export const responseStream: boolean;
        export const requestType: typeof import("../../common/v2/scanoss-common_pb.js").EchoRequest;
        export const responseType: typeof import("../../common/v2/scanoss-common_pb.js").EchoResponse;
        export { serialize_scanoss_api_common_v2_EchoRequest as requestSerialize };
        export { deserialize_scanoss_api_common_v2_EchoRequest as requestDeserialize };
        export { serialize_scanoss_api_common_v2_EchoResponse as responseSerialize };
        export { deserialize_scanoss_api_common_v2_EchoResponse as responseDeserialize };
    }
    namespace getAlgorithms {
        const path_1: string;
        export { path_1 as path };
        const requestStream_1: boolean;
        export { requestStream_1 as requestStream };
        const responseStream_1: boolean;
        export { responseStream_1 as responseStream };
        const requestType_1: typeof import("../../common/v2/scanoss-common_pb.js").PurlRequest;
        export { requestType_1 as requestType };
        const responseType_1: typeof import("./scanoss-cryptography_pb.js").AlgorithmResponse;
        export { responseType_1 as responseType };
        export { serialize_scanoss_api_common_v2_PurlRequest as requestSerialize };
        export { deserialize_scanoss_api_common_v2_PurlRequest as requestDeserialize };
        export { serialize_scanoss_api_cryptography_v2_AlgorithmResponse as responseSerialize };
        export { deserialize_scanoss_api_cryptography_v2_AlgorithmResponse as responseDeserialize };
    }
}
export var CryptographyClient: import("@grpc/grpc-js").ServiceClientConstructor;
declare function serialize_scanoss_api_common_v2_EchoRequest(arg: any): Buffer;
declare function deserialize_scanoss_api_common_v2_EchoRequest(buffer_arg: any): import("../../common/v2/scanoss-common_pb.js").EchoRequest;
declare function serialize_scanoss_api_common_v2_EchoResponse(arg: any): Buffer;
declare function deserialize_scanoss_api_common_v2_EchoResponse(buffer_arg: any): import("../../common/v2/scanoss-common_pb.js").EchoResponse;
declare function serialize_scanoss_api_common_v2_PurlRequest(arg: any): Buffer;
declare function deserialize_scanoss_api_common_v2_PurlRequest(buffer_arg: any): import("../../common/v2/scanoss-common_pb.js").PurlRequest;
declare function serialize_scanoss_api_cryptography_v2_AlgorithmResponse(arg: any): Buffer;
declare function deserialize_scanoss_api_cryptography_v2_AlgorithmResponse(buffer_arg: any): import("./scanoss-cryptography_pb.js").AlgorithmResponse;
export {};
