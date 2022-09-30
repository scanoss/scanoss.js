import fs from 'fs';
import { expect } from 'chai';
import path from 'path';

import { SummaryDataLayer } from '../../../../src/sdk/DataLayer/DataLayerTypes';
import {
  SummaryDataProvider
} from '../../../../src/sdk/DataLayer/DataProviders/SummaryDataProvider';


describe('Suit test for SummaryDataProvider', () => {

  it('Simple test SummaryDataProvider',  function () {
    const result = JSON.parse(fs.readFileSync(path.join(__dirname, '/samples/results-with-dep.json'), 'utf-8'));

    const date = new Date(737272800000);

    const summaryDataProvider = new SummaryDataProvider("Test project", date, result.scanner);
    const summaryData = summaryDataProvider.getData();

    const expectedOutput: SummaryDataLayer = {
      projectName: "Test project",
      timestamp: date,
      totalFiles: 4,
      noMatchFiles: 0,
      matchedFiles: 4,
    }

    expect(summaryData.summary).to.deep.equal(expectedOutput);

  });

});


