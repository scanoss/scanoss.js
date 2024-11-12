import {
  EchoRequest,
  EchoResponse,
  ServiceMethod, StatusResponse
} from "./index";

export interface DependencyService {
  echo: ServiceMethod<EchoRequest, EchoResponse>;
  get: ServiceMethod<DependencyRequest, DependencyResponse>;
}


export interface DependencyRequest {
  files: Array<{
    file: string;
    purls: Array<{
      purl: string;
      requirement?: string;
    }>;
  }>;
  depth: number;
}

export interface DependencyResponse {
  files: Array<{
    file: string;
    id: string;
    status: string;
    dependencies: Array<{
      component: string;
      purl: string;
      version: string;
      licenses: Array<{
        name: string;
        spdx_id: string;
        is_spdx_approved: boolean;
        url: string;
      }>;
      url: string;
      comment: string;
    }>;
  }>;
  status: StatusResponse;
}
