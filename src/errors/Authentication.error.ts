import { ScanossError } from './Base.error';

export class AuthenticationError extends ScanossError {
  constructor(message: string = 'Authentication failed') {
    super(message);
  }
}
