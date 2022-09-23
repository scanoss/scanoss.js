import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

import { ComponentDataProvider } from '../../../src/sdk/DataLayer/DataProviders/ComponentDataProvider';
import { DependencyDataProvider } from '../../../src/sdk/DataLayer/DataProviders/DependencyDataProvider';
import { ComponentDataLayer } from '../../../src/sdk/DataLayer/DataLayerTypes';
import { DataProviderManager } from '../../../src/sdk/DataLayer/DataProviderManager';

describe('Suit test for DataProviderManager', () => {

  it('Test ComponentDataLayer',  function () {

    const scannerOutput = JSON.parse(fs.readFileSync(path.join(__dirname, '/samples/simple/results-with-dep.json'), 'utf-8'));
    const expectedOutput = JSON.parse(fs.readFileSync(path.join(__dirname, '/samples/simple/expected-output.json'), 'utf-8'));

    const dataProviderManager = new DataProviderManager();

    dataProviderManager.addLayer(new ComponentDataProvider(scannerOutput.scanner));
    dataProviderManager.addLayer(new DependencyDataProvider(scannerOutput.dependencies));

    const dataLayer = dataProviderManager.generateData();

    expect(dataLayer).to.be.deep.equal(expectedOutput);

  });

});
