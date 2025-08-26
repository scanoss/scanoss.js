import { ICryptographyClient } from './ICryptographyClient';
import { CryptographyHttpClient } from './CryptographyHttpClient';
import { CryptographyClient } from './CryptographyClient';
import { Protocol, ClientConfig } from "../interfaces/ClientConfig";


export class CryptographyServiceFactory {
  public static create(config: ClientConfig): ICryptographyClient {
    const { token, hostName, proxyHost, caCertPath, protocol = Protocol.REST } = config;

    if (!token) {
      throw new Error('API token is required');
    }

    if (!hostName) {
      throw new Error('Hostname is required');
    }

    switch (protocol) {
      case Protocol.REST:
        return new CryptographyHttpClient(token, hostName, proxyHost, caCertPath);
      case Protocol.GRPC:
        return new CryptographyClient(token, hostName, proxyHost, caCertPath);
      default:
        return new CryptographyHttpClient(token, hostName, proxyHost, caCertPath);
    }
  }

  public static createREST(token: string, hostName: string, proxyHost?: string, caCertPath?: string): ICryptographyClient {
    return this.create({ token, hostName, proxyHost, caCertPath, protocol: Protocol.REST });
  }

  public static createGRPC(token: string, hostName: string, proxyHost?: string, caCertPath?: string): ICryptographyClient {
    return this.create({ token, hostName, proxyHost, caCertPath, protocol: Protocol.GRPC });
  }
}
