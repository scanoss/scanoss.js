import { CryptographyService } from "./Cryptography";
import { DependencyService } from "./Dependency";

/**
 * ScanossServices interface
 *
 * This interface defines the structure of all services provided by the SCANOSS SDK.
 * It serves as a single source of truth for available services and their methods.
 * Each property represents a specific service (e.g., cryptography, dependency) and
 * maps to its corresponding service interface.
 */
export interface ScanossServices {
  cryptography: CryptographyService;
  dependency: DependencyService;
}

/**
 * Common Request and Common Response Interfaces
 */
export interface EchoRequest {
  message: string;
}

export interface EchoResponse {
  message: string;
}

export interface PurlRequest {
  purls: Array<{
    purl: string;
    requirement?: string;
  }>
}

export enum StatusCode {
  UNSPECIFIED = 0,
  SUCCESS = 1,
  SUCCEEDED_WITH_WARNINGS = 2,
  WARNING = 3,
  FAILED = 4
}

export interface StatusResponse {
  // response status
  status: StatusCode;
  // Status message
  message: string;
}

/**
 * ExtractServiceMethod type
 *
 * A utility type that extracts the ServiceMethod type for a given service and method.
 * This is used to infer the correct parameter and result types for a specific service method.
 *
 * @template S - The service key (must be a key of ScanossServices)
 * @template M - The method key (must be a key of the selected service)
 */
export type ExtractServiceMethod<
  S extends keyof ScanossServices,
  M extends keyof ScanossServices[S]
> = ScanossServices[S][M] extends ServiceMethod<infer P, infer R> ? ServiceMethod<P, R> : never;


/**
 * ServiceMethod interface
 *
 * Defines the structure of a service method, including its parameter and result types.
 * This is a generic interface that can be used to type-check service methods.
 *
 * @template P - The type of the parameters for the service method
 * @template R - The type of the result returned by the service method
 */
export interface ServiceMethod<P = any, R = any> {
  params: P;
  result: R;
}

// Export all types from common, cryptography, and dependency modules
export * from "./Cryptography";
export * from "./Dependency";
