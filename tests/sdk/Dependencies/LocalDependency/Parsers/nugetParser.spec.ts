import fs from 'fs'
import {
  csprojParser,
  packagesConfigParser
} from '../../../../../src/sdk/Dependencies/LocalDependency/parsers/nugetParser';
import { ILocalDependency } from '../../../../../src/sdk/Dependencies/LocalDependency/DependencyTypes'
import path from 'path';

const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
chai.use(deepEqualInAnyOrder);
const { expect } = chai;

describe('Suit test for .csproj parser', function() {

  it('Testing valids .csproj files', async function (){
    const tests: Array <{
      inputPath: string;
      expectedResult: ILocalDependency;
    }> = [{
      inputPath: path.join(__dirname,"./samples/nuget/netcore.csproj"),
      expectedResult: {file: 'netcore.csproj', purls: [
          {purl:"pkg:nuget/Newtonsoft.Json", requirement:"13.0.2"},
        ]}
    },{
      inputPath: path.join(__dirname,"./samples/nuget/NoDependencies.csproj"),
      expectedResult: {file: 'NoDependencies.csproj', purls: []}
    },{
      inputPath: path.join(__dirname,"./samples/nuget/netcore-2.csproj"),
      expectedResult: {file: 'netcore-2.csproj', purls: [
          {purl:"pkg:nuget/Newtonsoft.Json", requirement:"13.0.2"},
          {purl:"pkg:nuget/Newtonsoft-dual.Json", requirement:"13.0.2"},
        ]}
    },

    ];

    for (const test of tests) {
      const fileContent = fs.readFileSync(test.inputPath,  {encoding:'utf-8'});
      const result = await csprojParser(fileContent, path.basename(test.inputPath));
      expect(result).to.deep.equalInAnyOrder(test.expectedResult)
    }
  });

});






describe('Suit test for packages.config parser', function() {

  it('Testing valids package.config files', async function (){
    const tests: Array <{
      inputPath: string;
      expectedResult: ILocalDependency;
    }> = [{
      inputPath: path.join(__dirname,"./samples/nuget/packageConfig-1/packages.config"),
      expectedResult: {file: 'packages.config', purls: [
          {purl:"pkg:nuget/DockPanelSuite", requirement:"2.9.0.0"},
          {purl:"pkg:nuget/Mono.Options", requirement:"6.6.0.161"},
        ]}
    }];

    for (const test of tests) {
      const fileContent = fs.readFileSync(test.inputPath,  {encoding:'utf-8'});
      const result = await packagesConfigParser(fileContent, path.basename(test.inputPath));
      expect(result).to.deep.equalInAnyOrder(test.expectedResult)
    }
  });

});
