import fs from 'fs';
import { expect } from 'chai';
import path from 'path';

import { DependencyDataProvider } from '../../../../src/sdk/Report/DataLayer/DataProviders/DependencyDataProvider';
import { DependencyDataLayer } from '../../../../src/sdk/Report/DataLayer/DataLayerTypes';

describe('Suit test for Dependency Data Provider', () => {
  it('Test Simple case Dependency Data provider', function () {
    const result = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '/samples/results-with-dep.json'),
        'utf-8'
      )
    );
    const dependencyDataProvider = new DependencyDataProvider(
      result.dependencies
    );
    const dependencyData = dependencyDataProvider.getData();

    const expectedOutput: DependencyDataLayer[] = [
      {
        file: '/home/ubuntu/Projects/url-parse/package.json',
        dependencies: [
          {
            component: 'querystringify',
            purl: 'pkg:npm/querystringify',
            version: '2.2.0',
            licenses: [{ name: 'MIT', spdxid: 'MIT' }],
          },
          {
            component: 'requires-port',
            purl: 'pkg:npm/requires-port',
            version: '1.0.0',
            licenses: [{ name: 'MIT', spdxid: 'MIT' }],
          },
          {
            component: 'assume',
            purl: 'pkg:npm/assume',
            version: '2.3.0',
            licenses: [{ name: 'MIT', spdxid: 'MIT' }],
          },
          {
            component: 'browserify',
            purl: 'pkg:npm/browserify',
            version: '17.0.0',
            licenses: [{ name: 'MIT', spdxid: 'MIT' }],
          },
        ],
      },
    ];

    expect(dependencyData.dependencies).to.be.deep.equal(expectedOutput);
  });
});
