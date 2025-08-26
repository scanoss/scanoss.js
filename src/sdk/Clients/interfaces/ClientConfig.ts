export enum Protocol {
  REST = 'REST',
  GRPC = 'GRPC'
}

export interface ClientConfig {
  token?: string;
  hostName: string;
  proxyHost?: string;
  caCertPath?: string;
  protocol?: Protocol;
}
