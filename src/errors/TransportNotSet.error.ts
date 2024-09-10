import { ScanossError } from "./Base.error";

/**
 * Error thrown when an operation requiring a transport is attempted,
 * but no transport has been set.
 */
export class TransportNotSetError extends ScanossError {
  constructor(message: string = 'Index not set. Cannot perform remote operations.') {
    super(message);
  }
}
