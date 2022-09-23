import fs from 'fs';
import { expect } from 'chai';
import path from 'path';

import { ComponentDataProvider } from '../../../../src/sdk/DataLayer/DataProviders/ComponentDataProvider';
import { ComponentDataLayer } from '../../../../src/sdk/DataLayer/DataLayerTypes';


describe('Suit test for DataProvider', () => {

  it('Test ComponentDataLayer',  function () {
    const result = JSON.parse(fs.readFileSync(path.join(__dirname, '/samples/results-with-dep.json'), 'utf-8'));
    const componentDataProvider = new ComponentDataProvider(result.scanner);
    const componentData = componentDataProvider.getData();

    const expectedOutput: ComponentDataLayer[] = [

      //First component
      {
        key : "pkg:npm/url-parse",
        purls: [
          "pkg:npm/url-parse",
          "pkg:github/unshiftio/url-parse",
          "pkg:deb/debian/node-url-parse",
          "pkg:maven/org.webjars.bowergithub.unshiftio/url-parse"
        ],
        name: "url-parse",
        vendor: "Arnout Kazemier",
        url: "https://www.npmjs.com/package/url-parse",
        versions: [
          {
            version: "1.5.10",
            licenses: ["MIT"],
            copyrights: [
              {
                name: "Copyright (c) 2015 Unshift.io; Arnout Kazemier;  the Contributors.",
                source: "license_file"
              }
            ]
          }
        ]
      },

      //Second component with multiple versions detected
      {
        key: "pkg:github/unshiftio/url-parse",
        purls: [
          "pkg:github/unshiftio/url-parse",
          "pkg:deb/debian/node-url-parse",
          "pkg:maven/org.webjars.bowergithub.unshiftio/url-parse",
          "pkg:npm/url-parse"
        ],
        name: "url-parse",
        vendor: "unshiftio",
        url: "https://github.com/unshiftio/url-parse",
        versions: [
          {
            version: "1.5.3",
            licenses: ["MIT"],
            copyrights: [
              {
                name: "Copyright (c) 2015 Unshift.io; Arnout Kazemier;  the Contributors.",
                source: "license_file"
              }
            ]
          },
          {
            version: "1.5.0",
            licenses: ["MIT"],
            copyrights: [
              {
                name: "Copyright (c) 2015 Unshift.io; Arnout Kazemier;  the Contributors.",
                source: "license_file"
              }
            ]
          },
          {
            version: "1.5.10",
            licenses: ["MIT"],
            copyrights: [
              {
                name: "Copyright (c) 2015 Unshift.io; Arnout Kazemier;  the Contributors.",
                source: "license_file"
              }
            ]
          }
        ]
      }
      ];

    expect(componentData.component).to.deep.equal(expectedOutput);

  });

});


