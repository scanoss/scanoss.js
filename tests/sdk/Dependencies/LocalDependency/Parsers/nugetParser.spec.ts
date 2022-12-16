import fs from 'fs'
import {
  csprojParser,
  packageConfigParser
} from '../../../../../src/sdk/Dependencies/LocalDependency/parsers/nugetParser';
import { ILocalDependency } from '../../../../../src/sdk/Dependencies/LocalDependency/DependencyTypes'
import { expect } from 'chai';
import path from 'path';


describe('Suit test for .csproj parser', function() {

  it('Testing valids .csproj files', function (){
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
      const result = csprojParser(fileContent, path.basename(test.inputPath));
      expect(result).to.deep.equal(test.expectedResult)
    }
  });

});






describe('Suit test for package.config parser', function() {

  it('Testing valids package.config files', function (){
    const tests: Array <{
      inputPath: string;
      expectedResult: ILocalDependency;
    }> = [{
      inputPath: path.join(__dirname,"./samples/nuget/packageConfig-1/package.config"),
      expectedResult: {file: 'package.config', purls: [
          {purl:"pkg:nuget/DockPanelSuite", requirement:"2.9.0.0"},
          {purl:"pkg:nuget/Mono.Options", requirement:"6.6.0.161"},
        ]}
    }];

    for (const test of tests) {
      const fileContent = fs.readFileSync(test.inputPath,  {encoding:'utf-8'});
      const result = packageConfigParser(fileContent, path.basename(test.inputPath));
      expect(result).to.deep.equal(test.expectedResult)
    }
  });

});
