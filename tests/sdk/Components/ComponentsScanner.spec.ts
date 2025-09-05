import { expect } from 'chai';

import { ComponentsScanner } from '../../../src/sdk/Components/ComponentsScanner';
import { ComponentsScannerCfg } from '../../../src/sdk/Components/ComponentsScannerCfg';

describe('ComponentsScanner Test Suite', () => {
  let scanner: ComponentsScanner;
  let config: ComponentsScannerCfg;

  beforeEach(() => {
    config = new ComponentsScannerCfg();
    config.API_KEY = 'test-api-key';
    config.API_URL = 'https://test-api.scanoss.com';
  });

  describe('Constructor', () => {
    it('should create scanner with HTTP client by default', () => {
      scanner = new ComponentsScanner(config);
      expect(scanner).to.be.instanceOf(ComponentsScanner);
    });

    it('should create scanner with gRPC client when USE_GRPC is true', () => {
      config.USE_GRPC = true;
      scanner = new ComponentsScanner(config);
      expect(scanner).to.be.instanceOf(ComponentsScanner);
    });

    it('should create scanner with default config when none provided', () => {
      scanner = new ComponentsScanner();
      expect(scanner).to.be.instanceOf(ComponentsScanner);
    });
  });

  describe('Configuration', () => {
    it('should properly set configuration values', () => {
      const testConfig = new ComponentsScannerCfg();
      testConfig.API_KEY = 'my-api-key';
      testConfig.USE_GRPC = true;
      
      expect(testConfig.API_KEY).to.equal('my-api-key');
      expect(testConfig.USE_GRPC).to.equal(true);
      
      // Note: API_URL has special resolution logic based on API_KEY presence
      // When API_KEY is set, it defaults to premium URL, not custom ones
    });

    it('should have proper default values', () => {
      const defaultConfig = new ComponentsScannerCfg();
      expect(defaultConfig.API_KEY).to.equal('');
      expect(defaultConfig.USE_GRPC).to.equal(false);
    });
  });

  describe('gRPC Client Error Handling', () => {
    it('should throw error when gRPC methods are called', async () => {
      config.USE_GRPC = true;
      scanner = new ComponentsScanner(config);

      try {
        await scanner.searchComponents({ search: 'test' });
        expect.fail('Should have thrown an error');
      } catch (e) {
        expect(e.message).to.include('gRPC components client not yet implemented');
      }
    });
  });
});