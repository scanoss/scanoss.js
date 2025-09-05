export interface ClientConfig {
  PAC_PROXY?: string;
  API_KEY?: string;
  NO_PROXY?: string;
  HTTP_PROXY?: string;
  HTTPS_PROXY?: string;
  IGNORE_CERT_ERRORS?: boolean;
  CA_CERT?: string;
  HOST_URL: string;
}
