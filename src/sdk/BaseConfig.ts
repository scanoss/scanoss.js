import fs from 'fs';

/**
 * Base configuration class for SCANOSS SDK services.
 * Provides common proxy and network configuration settings for HTTP and gRPC connections.
 */
export abstract class BaseConfig {
  /** HTTPS proxy server URL */
  private _HTTPS_PROXY: string = '';

  /** HTTP proxy server URL */
  private _HTTP_PROXY: string = '';

  /** Comma-separated list of hosts to bypass proxy for */
  private _NO_PROXY: string = '';

  /** API URL for service connections */
  private _API_URL: string = '';

  /** gRPC proxy server URL */
  private _GRPC_PROXY: string = '';

  /** Path to the CA certificate file for SSL/TLS connections */
  private _CA_CERT = '';

  /** Whether to ignore CA certificate errors */
  private _IGNORE_CA_CERT_ERR?: boolean = false;

  /**
   * Creates a new BaseConfig instance.
   * @param config - Optional configuration object to copy settings from
   */
  constructor(config?: BaseConfig) {
    if (config) {
      this.HTTPS_PROXY = config.HTTPS_PROXY || '';
      this.HTTP_PROXY = config.HTTP_PROXY || '';
      this.NO_PROXY = config.NO_PROXY || '';
      this.GRPC_PROXY = config.GRPC_PROXY || '';
      this.CA_CERT = config.CA_CERT || '';
      this.IGNORE_CA_CERT_ERR = config.IGNORE_CA_CERT_ERR ?? false;
      this.API_URL = config.API_URL || BaseConfig.getDefaultURL();
    }
    this.API_URL = this.API_URL || BaseConfig.getDefaultURL();
  }

  /**
   * Returns the default SCANOSS API URL.
   * @returns The default API endpoint URL
   */
  public static getDefaultURL(): string {
    return 'https://api.osskb.org';
  }

  /**
   * Returns the premium SCANOSS API URL.
   * @returns The premium API endpoint URL
   */
  public static getPremiumURL(): string {
    return 'https://api.scanoss.com';
  }

  /**
   * Resolves the appropriate API URL based on API key presence and current URL.
   * If an API key is provided and the current URL is the default, returns the premium
   * URL, otherwise returns the current URL.
   * @param apiKey - The API key (if any)
   * @param currentUrl - The current API URL
   * @returns The resolved API URL
   */
  protected abstract resolveApiUrl(apiKey: string, currentUrl: string): string;

  /**
   * Sets the HTTPS proxy server URL.
   * @param value - HTTPS proxy URL
   */
  set HTTPS_PROXY(value: string) {
    this._HTTPS_PROXY = value;
  }

  /**
   * Sets the HTTP proxy server URL.
   * @param value - HTTP proxy URL
   */
  set HTTP_PROXY(value: string) {
    this._HTTP_PROXY = value;
  }

  /**
   * Sets the comma-separated list of hosts to bypass proxy for.
   * @param value - NO_PROXY hosts list
   */
  set NO_PROXY(value: string) {
    this._NO_PROXY = value;
  }

  /**
   * Sets the API URL for service connections with validation
   * @param value - The API URL (must start with http:// or https://)
   * @throws {Error} When the URL is empty, missing http/https protocol, or has invalid format
   */
  set API_URL(value: string) {
    if (!value) {
      throw new Error('API_URL is required and cannot be empty');
    }

    if (!value.startsWith('http')) {
      throw new Error(`API_URL must start with 'http://' or 'https://', got: '${value}'`);
    }

    try {
      new URL(value);
      this._API_URL = value;
    } catch (e) {
      throw new Error(`Invalid API_URL format '${value}': ${e.message}`);
    }
  }

  /**
   * Sets the gRPC proxy server URL.
   * @param value - gRPC proxy URL
   */
  set GRPC_PROXY(value: string) {
    this._GRPC_PROXY = value;
  }

  /**
   * Sets the CA certificate file path for SSL/TLS connections.
   * @param caCertPath - Path to the CA certificate file
   * @throws {Error} When the certificate file does not exist or cannot be read
   */
  set CA_CERT(caCertPath: string) {
    if (caCertPath == null || caCertPath === '') return;
    try {
        fs.readFileSync(caCertPath);
        this._CA_CERT = caCertPath;
    } catch(e) {
      throw new Error(`Certificate file not found: '${caCertPath}'`);
    }
  }

  /**
   * Sets whether to ignore CA certificate errors.
   * @param value - True to ignore certificate errors, false otherwise
   */
  set IGNORE_CA_CERT_ERR(value: boolean) {
    this._IGNORE_CA_CERT_ERR = value;
  }

  /**
   * Gets the HTTPS proxy server URL.
   * @returns HTTPS proxy URL
   */
  get HTTPS_PROXY(): string {
    return this._HTTPS_PROXY;
  }

  /**
   * Gets the HTTP proxy server URL.
   * @returns HTTP proxy URL
   */
  get HTTP_PROXY(): string {
    return this._HTTP_PROXY;
  }

  /**
   * Gets the comma-separated list of hosts to bypass proxy for.
   * @returns NO_PROXY hosts list
   */
  get NO_PROXY(): string {
    return this._NO_PROXY;
  }

  /**
   * Gets the API URL for service connections.
   * @returns API URL
   */
  get API_URL(): string {
    return this._API_URL;
  }

  /**
   * Gets the gRPC proxy server URL.
   * @returns gRPC proxy URL
   */
  get GRPC_PROXY(): string {
    return this._GRPC_PROXY;
  }

  /**
   * Gets the path to the CA certificate file.
   * @returns CA certificate file path
   */
  get CA_CERT(): string {
    return this._CA_CERT;
  }

  /**
   * Gets whether CA certificate errors should be ignored.
   * @returns True if certificate errors are ignored, false otherwise
   */
  get IGNORE_CA_CERT_ERR(): boolean {
    return this._IGNORE_CA_CERT_ERR;
  }

}
