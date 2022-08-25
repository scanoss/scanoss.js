import { expect } from 'chai';
import {
  IReportData,
  ISaveResponse
} from '../../src/lib/modules/reports/types';
import {
  HTMLReport
} from '../../src/lib/modules/reports/htmlReport/HTMLReport';

const fs = require('fs').promises;
const path = require('path');

describe('Suit test for HTML report', function() {

  it('Testing report adapters', async function() {
    const test: {
      projectName: string;
      resultsPath: string;
      dependenciesPath: string;
      outputPath: string;
      expectedResult: IReportData
    } = {
      projectName: "Test name",
      resultsPath: path.join(__dirname, "../data/reports/result.json"),
      dependenciesPath: path.join(__dirname, "../data/reports/dependencies.json"),
      outputPath: path.join(__dirname, "../data/reports/outputs/"),
      expectedResult: {
        "projectName": "Test name",
        "licenses": [{
          "value": 2,
          "label": "GPL-2.0-only",
          "copyleft": true,
          "hasIncompatibles": ["Apache-2.0"],
          "incompatibleWith": ["Apache-1.0", "Apache-1.1", "Apache-2.0", "BSD-4-Clause", "BSD-4-Clause-UC", "FTL", "IJG", "OpenSSL", "Python-2.0", "zlib-acknowledgement", "XFree86-1.1"],
          "components": [{
            "purl": "pkg:github/scanoss/scanner.c",
            "vendor": "scanoss",
            "versions": ["1.3.3"],
            "name": "scanner.c",
            "url": "https://github.com/scanoss/scanner.c"
          }, {
            "purl": "pkg:github/scanoss/minr",
            "vendor": "scanoss",
            "versions": ["2.0.6"],
            "name": "minr",
            "url": "https://github.com/scanoss/minr"
          }]
        }, {
          "value": 2,
          "label": "GPL-2.0-or-later",
          "copyleft": true,
          "hasIncompatibles": ["Apache-2.0"],
          "incompatibleWith": ["Apache-1.0", "Apache-1.1", "Apache-2.0", "BSD-4-Clause", "BSD-4-Clause-UC", "FTL", "IJG", "OpenSSL", "Python-2.0", "zlib-acknowledgement", "XFree86-1.1"],
          "components": [{
            "purl": "pkg:github/scanoss/scanner.c",
            "vendor": "scanoss",
            "versions": ["1.3.3"],
            "name": "scanner.c",
            "url": "https://github.com/scanoss/scanner.c"
          }, {
            "purl": "pkg:github/scanoss/minr",
            "vendor": "scanoss",
            "versions": ["2.0.6"],
            "name": "minr",
            "url": "https://github.com/scanoss/minr"
          }]
        }, {
          "value": 2,
          "label": "GPL-1.0-or-later",
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:github/scanoss/scanner.c",
            "vendor": "scanoss",
            "versions": ["1.3.3"],
            "name": "scanner.c",
            "url": "https://github.com/scanoss/scanner.c"
          }, {
            "purl": "pkg:github/scanoss/minr",
            "vendor": "scanoss",
            "versions": ["2.0.6"],
            "name": "minr",
            "url": "https://github.com/scanoss/minr"
          }]
        }, {
          "value": 2,
          "label": "BSD-2-Clause",
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:github/scanoss/scanner.c",
            "vendor": "scanoss",
            "versions": ["1.3.3"],
            "name": "scanner.c",
            "url": "https://github.com/scanoss/scanner.c"
          }, {
            "purl": "pkg:github/scanoss/minr",
            "vendor": "scanoss",
            "versions": ["2.0.6"],
            "name": "minr",
            "url": "https://github.com/scanoss/minr"
          }]
        }, {
          "value": 1,
          "label": "Zlib",
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:github/scanoss/scanner.c",
            "vendor": "scanoss",
            "versions": ["1.00"],
            "name": "scanner.c",
            "url": "https://github.com/scanoss/scanner.c"
          }]
        }, {
          "value": 1,
          "label": "LicenseRef-scancode-free-unknown",
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:github/scanoss/scanner.c",
            "vendor": "scanoss",
            "versions": ["1.1.6"],
            "name": "scanner.c",
            "url": "https://github.com/scanoss/scanner.c"
          }]
        }, {
          "value": 1,
          "label": "CC0-1.0",
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:github/scanoss/scanner.c",
            "vendor": "scanoss",
            "versions": ["1.3.3"],
            "name": "scanner.c",
            "url": "https://github.com/scanoss/scanner.c"
          }]
        }, {
          "label": "Apache-2.0",
          "value": 1,
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:pypi/requests",
            "vendor": "",
            "versions": ["2.28.1"],
            "name": "requests",
            "url": ""
          }]
        }, {
          "label": "LGPL-2.1-or-later",
          "value": 1,
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:pypi/crc32c",
            "vendor": "",
            "versions": ["2.3"],
            "name": "crc32c",
            "url": ""
          }]
        }, {
          "label": "0BSD",
          "value": 1,
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:pypi/binaryornot",
            "vendor": "",
            "versions": ["0.4.4"],
            "name": "binaryornot",
            "url": ""
          }]
        }, {
          "label": "ISC",
          "value": 1,
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:pypi/progress",
            "vendor": "",
            "versions": ["1.6"],
            "name": "progress",
            "url": ""
          }]
        }, {
          "label": "BSD-3-Clause",
          "value": 1,
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:pypi/protobuf",
            "vendor": "",
            "versions": ["4.21.2"],
            "name": "protobuf",
            "url": ""
          }]
        }, {
          "label": "MIT",
          "value": 3,
          "copyleft": false,
          "hasIncompatibles": [],
          "incompatibleWith": [],
          "components": [{
            "purl": "pkg:pypi/pytest",
            "vendor": "",
            "versions": ["7.1.2"],
            "name": "pytest",
            "url": ""
          }, {
            "purl": "pkg:pypi/pytest-cov",
            "vendor": "",
            "versions": ["3.0.0"],
            "name": "pytest-cov",
            "url": ""
          }, {
            "purl": "pkg:pypi/beautifulsoup4",
            "vendor": "",
            "versions": ["4.11.1"],
            "name": "beautifulsoup4",
            "url": ""
          }]
        }],
        "summary": { "matchedFiles": 16, "noMatchFiles": 14, "totalFiles": 30 },
        "date": "Fri, 19 Aug 2022 13:41:51 GMT"
      }
    };

      const htmlReport = new HTMLReport({
        projectName: test.projectName,
        resultPath: test.resultsPath,
        dependencyPath: test.dependenciesPath,
        outputPath: test.outputPath,
    });
      // Replaces actual date to test.expectedResult date
    const reportData = await htmlReport.getReportData();
    reportData.date = test.expectedResult.date;
   expect(reportData).to.be.deep.equal(test.expectedResult);
  });


});
