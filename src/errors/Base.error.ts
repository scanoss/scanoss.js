/**
 * Base class for all SCANOSS SDK errors.
 * Extends the native Error class with a custom name property.
 */
export class ScanossError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // This line is necessary for proper stack trace in TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
