import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

import { ComponentDataProvider } from '../../../src/sdk/DataLayer/DataProviders/ComponentDataProvider';
import { DependencyDataProvider } from '../../../src/sdk/DataLayer/DataProviders/DependencyDataProvider';
import { SummaryDataProvider } from '../../../src/sdk/DataLayer/DataProviders/SummaryDataProvider';
import { LicenseDataProvider } from '../../../src/sdk/DataLayer/DataProviders/LicenseDataProvider';

import { DataProviderManager } from '../../../src/sdk/DataLayer/DataProviderManager';

// describe('Suit test for DataProviderManager', () => {
//
//   it('Test DataProviderManager Simple',  function () {
//
//   });
//
//
// });
