import { expect } from 'chai';
import sinon from 'sinon';
import { DependencyModule, ExtractedComponent,DecoratedDependency, DependencyPURLExtractor  } from './Dependency.module';
import { Transport } from '../api/transport';
import { DependencyApi,  } from '../api/Dependency.api';
import {  StatusCode } from '../api/types';
import * as fs from 'fs/promises';
let dependencyModule: DependencyModule;
let mockTransport: Transport;
let mockApi: sinon.SinonStubbedInstance<DependencyApi>;
let mockExtractor: DependencyPURLExtractor;
import mock from 'mock-fs';

describe('DependencyModule', () => {
  let dependencyModule: DependencyModule;
  let mockTransport: Transport;
  let mockApi: sinon.SinonStubbedInstance<DependencyApi>;
  let mockExtractor: DependencyPURLExtractor;

  beforeEach(() => {
    mockTransport = {
      execute: sinon.stub(),
    };

    mockApi = sinon.createStubInstance(DependencyApi);

    mockExtractor = {
      run: sinon.stub(),
    };

    dependencyModule = new DependencyModule({transport: mockTransport, purlExtractor: mockExtractor});
    (dependencyModule as any).api = mockApi;
  });

  afterEach(() => {
    sinon.restore();
    mock.restore();
  });


  describe('addFile', () => {
    it('should add a file to the list', () => {
      dependencyModule.addFile('test.js');
      expect((dependencyModule as any).files).to.include('test.js');
    });

    it('should return this for chaining', () => {
      const result = dependencyModule.addFile('test.js');
      expect(result).to.equal(dependencyModule);
    });
  });

  describe('addFiles', () => {
    it('should add multiple files to the list', () => {
      dependencyModule.addFiles(['test1.js', 'test2.js']);
      expect((dependencyModule as any).files).to.include('test1.js');
      expect((dependencyModule as any).files).to.include('test2.js');
    });

    it('should return this for chaining', () => {
      const result = dependencyModule.addFiles(['test1.js', 'test2.js']);
      expect(result).to.equal(dependencyModule);
    });
  });

  describe('addComponent', () => {
    it('should add a component to the list', () => {
      const component: ExtractedComponent = { purl: 'pkg:npm/test@1.0.0', scope: 'runtime' };
      dependencyModule.addComponent(component);
      expect((dependencyModule as any).components).to.deep.include(component);
    });

    it('should return this for chaining', () => {
      const component: ExtractedComponent = { purl: 'pkg:npm/test@1.0.0', scope: 'runtime' };
      const result = dependencyModule.addComponent(component);
      expect(result).to.equal(dependencyModule);
    });
  });

  describe('extract', () => {
    it('should extract dependencies from files and components', async () => {
      const mockFileContent = 'mock content';
      const mockExtractedDeps: ExtractedComponent[] = [
        { purl: 'pkg:npm/test@1.0.0', scope: 'runtime' },
      ];

      mock({
        'test.js': mockFileContent,
      });

      (mockExtractor.run as sinon.SinonStub).resolves(mockExtractedDeps);

      dependencyModule.addFile('test.js');
      dependencyModule.addComponent({ purl: 'pkg:npm/component@1.0.0', scope: 'runtime' });

      const result = await dependencyModule.extract();

      expect(result).to.deep.equal([
        { purl: 'pkg:npm/component@1.0.0', scope: 'runtime' },
        ...mockExtractedDeps,
      ]);

      expect((mockExtractor.run as sinon.SinonStub).calledOnce).to.be.true;
      expect((mockExtractor.run as sinon.SinonStub).firstCall.args[0]).to.deep.equal(Buffer.from(mockFileContent));
    });
  });

  describe('decorate', () => {
    it('should decorate dependencies', async () => {
      const mockDependencies: ExtractedComponent[] = [
        { purl: 'pkg:npm/test@1.0.0', scope: 'runtime' },
      ];

      const mockDecoratedDeps: DecoratedDependency[] = [{
        file: 'dummy.txt',
        id: '1',
        status: 'success',
        dependencies: [{
          component: 'test',
          purl: 'pkg:npm/test@1.0.0',
          version: '1.0.0',
          licenses: [],
          url: 'https://example.com',
          comment: '',
        }],
      }];

      mockApi.get.resolves({
        status: { status: StatusCode.SUCCESS, message: 'Success' },
        files: mockDecoratedDeps,
      });

      const result = await dependencyModule.decorate(mockDependencies);

      expect(result).to.deep.equal(mockDecoratedDeps);
      expect(mockApi.get.calledOnce).to.be.true;
      expect(mockApi.get.firstCall.args[0]).to.be.an('object');
    });
  });

  describe('extractAndDecorate', () => {
  });

  describe('reset', () => {
    it('should reset the internal state', () => {
      dependencyModule.addFile('test.js');
      dependencyModule.addComponent({ purl: 'pkg:npm/test@1.0.0', scope: 'runtime' });

      dependencyModule.reset();

      expect((dependencyModule as any).files).to.be.empty;
      expect((dependencyModule as any).components).to.be.empty;
      expect((dependencyModule as any).extractedDeps).to.be.empty;
    });

    it('should return this for chaining', () => {
      const result = dependencyModule.reset();
      expect(result).to.equal(dependencyModule);
    });
  });
});
