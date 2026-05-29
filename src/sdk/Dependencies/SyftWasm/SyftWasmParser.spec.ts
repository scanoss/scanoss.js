import { expect } from 'chai';
import { SyftWasmParser } from './SyftWasmParser';
import { isSyftWasmAvailable } from './loader';

describe('SyftWasmParser', () => {
  let parser: SyftWasmParser;

  before(function () {
    // Skip tests if WASM not built
    if (!isSyftWasmAvailable()) {
      this.skip();
    }
  });

  beforeEach(() => {
    parser = new SyftWasmParser();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await parser.init();
      const version = parser.getVersion();
      expect(version).to.be.a('string');
      expect(version).to.include('wasm');
    });

    it('should throw error if not initialized', () => {
      expect(() => parser.getVersion()).to.throw('not initialized');
    });
  });

  describe('file support', () => {
    it('should support package.json', () => {
      expect(parser.isSupported('package.json')).to.be.true;
    });

    it('should support requirements.txt', () => {
      expect(parser.isSupported('requirements.txt')).to.be.true;
    });

    it('should support go.mod', () => {
      expect(parser.isSupported('go.mod')).to.be.true;
    });

    it('should not support random files', () => {
      expect(parser.isSupported('random.txt')).to.be.false;
    });
  });

  describe('parsing', () => {
    beforeEach(async () => {
      await parser.init();
    });

    it('should parse package.json', async () => {
      const content = JSON.stringify({
        name: 'test-app',
        version: '1.0.0',
        dependencies: {
          express: '^4.18.0',
        },
      });

      const result = await parser.parseFile(content, 'package.json');

      expect(result).to.have.property('file', 'package.json');
      expect(result.purls).to.be.an('array');
      expect(result.purls.length).to.be.greaterThan(0);

      // Check PURL format
      const hasPurl = result.purls.some((p) => p.purl.startsWith('pkg:npm/'));
      expect(hasPurl).to.be.true;
    });

    it('should parse requirements.txt', async () => {
      const content = 'requests==2.28.0\nflask==2.0.1';

      const result = await parser.parseFile(content, 'requirements.txt');

      expect(result).to.have.property('file', 'requirements.txt');
      expect(result.purls).to.be.an('array');

      // Check for Python PURLs
      const hasPythonPurl = result.purls.some((p) => p.purl.startsWith('pkg:pypi/'));
      expect(hasPythonPurl).to.be.true;
    });

    it('should handle invalid content gracefully', async () => {
      const content = 'invalid json {{{';

      const result = await parser.parseFile(content, 'package.json');

      expect(result).to.have.property('file', 'package.json');
      expect(result.purls).to.be.an('array');
      // Should return empty array on error, not throw
    });
  });

  describe('multiple files', () => {
    beforeEach(async () => {
      await parser.init();
    });

    it('should parse multiple files', async () => {
      const files = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'test',
            dependencies: { express: '4.18.0' },
          }),
        },
        {
          path: 'requirements.txt',
          content: 'requests==2.28.0',
        },
      ];

      const result = await parser.parseFiles(files);

      expect(result.files).to.be.an('array');
      expect(result.files.length).to.be.greaterThan(0);
    });
  });
});
