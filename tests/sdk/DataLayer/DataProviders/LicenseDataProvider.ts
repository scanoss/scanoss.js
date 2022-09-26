import fs from 'fs';
import { expect } from 'chai';
import path from 'path';

import { LicenseDataLayer } from '../../../../src/sdk/DataLayer/DataLayerTypes';
import {
  LicenseDataProvider
} from '../../../../src/sdk/DataLayer/DataProviders/LicenseDataProvider';


describe('Suit test for LicenseDataProvider', () => {

  it('Simple test LicenseDataProvider',  function () {
    const result = JSON.parse(fs.readFileSync(path.join(__dirname, '/samples/results-with-dep.json'), 'utf-8'));

    const licenseDataProvider = new LicenseDataProvider(result.scanner, result.dependencies);
    const licenseData = licenseDataProvider.getData();


    // const expectedOutput: LicenseDataLayer[] = [
    //   {
    //
    //   }
    //   },
    //   {
    //   }];
    //
    //
    //
    //
    // expect(licenseData.licenses).to.deep.equal(expectedOutput);`

  });

});


