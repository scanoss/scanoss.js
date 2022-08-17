import { expect } from 'chai';
import {
  IReportData,
  ISaveResponse
} from '../../src/lib/modules/reports/types';
import {
  HTMLReport
} from '../../src/lib/modules/reports/htmlReport/HTMLReport';

const fs = require('fs');
const path = require('path');

describe('Suit test for HTML report', function() {

  it('Testing report adapters', async function() {
    const test: {
      resultsPath: string;
      dependenciesPath: string;
      basePath: string;
      expectedResult: IReportData
    } = {
      resultsPath: path.join(__dirname,"../data/reports/result.json"),
      dependenciesPath: path.join(__dirname,"../data/reports/dependencies.json"),
      basePath: path.join(__dirname,"../data/reports/outputs/"),
      expectedResult: {"licenses":[{"value":7,"label":"GPL-2.0-only","components":[{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.3.3","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"},{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.1.5","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"},{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.00","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"},{"purl":"pkg:github/scanoss/minr","vendor":"scanoss","version":"2.0.6","name":"minr","url":"https://github.com/scanoss/minr"},{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.1.6","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"},{"purl":"pkg:github/scanoss/minr","vendor":"scanoss","version":"1.18","name":"minr","url":"https://github.com/scanoss/minr"},{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.3.4","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"}]},{"value":3,"label":"GPL-2.0-or-later","components":[{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.3.3","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"},{"purl":"pkg:github/scanoss/minr","vendor":"scanoss","version":"2.0.6","name":"minr","url":"https://github.com/scanoss/minr"},{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.3.4","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"}]},{"value":3,"label":"GPL-1.0-or-later","components":[{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.3.3","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"},{"purl":"pkg:github/scanoss/minr","vendor":"scanoss","version":"2.0.6","name":"minr","url":"https://github.com/scanoss/minr"},{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.3.4","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"}]},{"value":3,"label":"BSD-2-Clause","components":[{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.3.3","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"},{"purl":"pkg:github/scanoss/minr","vendor":"scanoss","version":"2.0.6","name":"minr","url":"https://github.com/scanoss/minr"},{"purl":"pkg:github/scanoss/minr","vendor":"scanoss","version":"1.18","name":"minr","url":"https://github.com/scanoss/minr"}]},{"value":1,"label":"Zlib","components":[{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.00","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"}]},{"value":1,"label":"LicenseRef-scancode-free-unknown","components":[{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.1.6","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"}]},{"value":1,"label":"CC0-1.0","components":[{"purl":"pkg:github/scanoss/scanner.c","vendor":"scanoss","version":"1.3.3","name":"scanner.c","url":"https://github.com/scanoss/scanner.c"}]},{"label":"Apache 2.0","value":1,"components":[{"purl":"pkg:pypi/requests","vendor":"","version":"2.28.1","name":"requests","url":""}]},{"label":"LGPLv2.1+","value":1,"components":[{"purl":"pkg:pypi/crc32c","vendor":"","version":"2.3","name":"crc32c","url":""}]},{"label":"BSD","value":1,"components":[{"purl":"pkg:pypi/binaryornot","vendor":"","version":"0.4.4","name":"binaryornot","url":""}]},{"label":"ISC","value":1,"components":[{"purl":"pkg:pypi/progress","vendor":"","version":"1.6","name":"progress","url":""}]},{"label":"3-Clause BSD License","value":1,"components":[{"purl":"pkg:pypi/protobuf","vendor":"","version":"4.21.2","name":"protobuf","url":""}]},{"label":"MIT","value":3,"components":[{"purl":"pkg:pypi/pytest","vendor":"","version":"7.1.2","name":"pytest","url":""},{"purl":"pkg:pypi/pytest-cov","vendor":"","version":"3.0.0","name":"pytest-cov","url":""},{"purl":"pkg:pypi/beautifulsoup4","vendor":"","version":"4.11.1","name":"beautifulsoup4","url":""}]}],"summary":{"summary":{"matchFiles":0,"noMatchFiles":0,"filterFiles":0,"totalFiles":0},"identified":{"scan":0,"total":0},"pending":0,"original":0}}
    };
    const htmlReport = new HTMLReport({
      resultPath: test.resultsPath,
      dependencyPath: test.dependenciesPath,
      basePath: test.basePath
    });
    expect(await  htmlReport.getReportData()).to.be.deep.equal(test.expectedResult);
  });

  it('Testing HTML output ', async function() {
    const test: {
      resultsPath: string;
      dependenciesPath: string;
      basePath: string;
      expectedResult: ISaveResponse
    } = {
      resultsPath: path.join(__dirname,"../data/reports/result.json"),
      dependenciesPath: path.join(__dirname,"../data/reports/dependencies.json"),
      basePath: path.join(__dirname,"../data/reports/outputs/"),
      expectedResult: {
        status: 0,
        path: path.join(__dirname,'../data/reports/outputs/HTML/report.html'),
        format: '.html'
      }

    };

    const htmlReport = new HTMLReport({
      resultPath: test.resultsPath,
      dependencyPath: test.dependenciesPath,
      basePath: test.basePath
    });
    await htmlReport.generate();
    const response = await htmlReport.save();
    expect(response).to.be.deep.equal(test.expectedResult);
  });
});
