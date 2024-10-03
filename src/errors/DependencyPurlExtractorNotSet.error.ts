import { ScanossError } from "./Base.error";

/**
 * Error thrown when an operation requiring a dependency purl extractor is attempted,
 *
 */
export class DependencyPurlExtractorNotSetError extends ScanossError {
  constructor(message: string = 'Dependency Purl Extractor Not Setted') {
    super(message);
  }
}
