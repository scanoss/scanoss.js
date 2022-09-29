import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

import { ComponentDataProvider } from '../../../src/sdk/DataLayer/DataProviders/ComponentDataProvider';
import { DependencyDataProvider } from '../../../src/sdk/DataLayer/DataProviders/DependencyDataProvider';
import { SummaryDataProvider } from '../../../src/sdk/DataLayer/DataProviders/SummaryDataProvider';
import { LicenseDataProvider } from '../../../src/sdk/DataLayer/DataProviders/LicenseDataProvider';

import { DataProviderManager } from '../../../src/sdk/DataLayer/DataProviderManager';

//TODO; Extract all data from here and use for testing all other submodules
//expecter-results.json has all the data expected for ComponentDataLAyer, LicenseDataLAyer, so on.
describe('Suit test for DataProviderManager', () => {

  it('Test DataProviderManager Simple',  function () {

    const scannerOutput = JSON.parse(fs.readFileSync(path.join(__dirname, '/samples/simple/results-with-dep.json'), 'utf-8'));
    const expectedOutput = JSON.parse(fs.readFileSync(path.join(__dirname, '/samples/simple/expected-output.json'), 'utf-8'));

    const date = new Date(737272800000);

    expectedOutput.summary.timestamp = date
    const dataProviderManager = new DataProviderManager();


    dataProviderManager.addDataProvider(new ComponentDataProvider(scannerOutput.scanner, scannerOutput.dependencies));
    dataProviderManager.addDataProvider(new DependencyDataProvider(scannerOutput.dependencies));
    dataProviderManager.addDataProvider(new SummaryDataProvider("project-test", date,scannerOutput.scanner))
    dataProviderManager.addDataProvider(new LicenseDataProvider(scannerOutput.scanner, scannerOutput.dependencies))
    const dataLayer = dataProviderManager.generateData();

    expect(dataLayer).to.be.deep.equal(expectedOutput);

  });



  it('Test DataProviderManager Simple',  function () {

    const scannerOutput = JSON.parse(fs.readFileSync(path.join(__dirname, '/samples/simple-1/output1.json'), 'utf-8'));
    //const expectedOutput = JSON.parse(fs.readFileSync(path.join(__dirname, '/samples/simple/expected-output.json'), 'utf-8'));

    const date = new Date(737272800000);

    //expectedOutput.summary.timestamp = date
    const dataProviderManager = new DataProviderManager();


    dataProviderManager.addDataProvider(new ComponentDataProvider(scannerOutput.scanner, scannerOutput.dependencies));
    dataProviderManager.addDataProvider(new DependencyDataProvider(scannerOutput.dependencies));
    dataProviderManager.addDataProvider(new SummaryDataProvider("project-test", date,scannerOutput.scanner))
    dataProviderManager.addDataProvider(new LicenseDataProvider(scannerOutput.scanner, scannerOutput.dependencies))
    const dataLayer = dataProviderManager.generateData();

    //expect(dataLayer).to.be.deep.equal(expectedOutput);

  });

});
