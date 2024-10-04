import {
  EchoRequest,
  EchoResponse,
  PurlRequest,
  ServiceMethod, StatusResponse
} from "./index";

export interface CryptographyService {
  echo: ServiceMethod<EchoRequest, EchoResponse>;
  algorithms: ServiceMethod<PurlRequest, AlgorithmResponse>;
}


export interface AlgorithmResponse {
  purls: {
    purl: string;
    version: string;
    algorithms: Array<{
      algorithm: string;
      strength: string;
    }>
  };
  status: StatusResponse;
}
