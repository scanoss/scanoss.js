import fs from 'fs'
import { expect } from 'chai';
import path from 'path';

import { packagelockParser, yarnLockParser } from '../../../../../src/sdk/Dependencies/LocalDependency/parsers/npmParser';
import { ILocalDependency } from '../../../../../src/sdk/Dependencies/LocalDependency/DependencyTypes'

describe('Suit test for package lock parser', function() {
  //
  // it('Testing valids package-lock.json files', function (){
  //   const tests: [{
  //     inputPath: string;
  //     expectedResult: ILocalDependency;
  //   }] = [{
  //     inputPath: path.join(__dirname,"./samples/package-lock/1/package-lock.json"),
  //     expectedResult: {file: 'package-lock.json', purls: [
  //         {purl: "pkg:npm/ansi-regex", requirement: "3.0.1"},
  //         {purl: "pkg:npm/ansi-styles",requirement: "4.3.0"},
  //         {purl: "pkg:npm/camelcase", requirement: "5.3.1"},
  //         {purl: "pkg:npm/cliui", requirement: "6.0.0"},
  //         {purl: "pkg:npm/ansi-regex", requirement: "5.0.1"},
  //         {purl: "pkg:npm/is-fullwidth-code-point", requirement: "3.0.0"},
  //         {purl: "pkg:npm/string-width", requirement: "4.2.3"},
  //         {purl: "pkg:npm/strip-ansi", requirement: "6.0.1"},
  //         {purl: "pkg:npm/color-convert", requirement: "2.0.1"},
  //         {purl: "pkg:npm/color-name", requirement: "1.1.4"},
  //         {purl: "pkg:npm/cowsay", requirement: "1.5.0"},
  //         {purl: "pkg:npm/decamelize", requirement: "1.2.0"},
  //         {purl: "pkg:npm/emoji-regex", requirement: "8.0.0"},
  //         {purl: "pkg:npm/find-up", requirement: "4.1.0"},
  //         {purl: "pkg:npm/get-caller-file", requirement: "2.0.5"},
  //         {purl: "pkg:npm/get-stdin", requirement: "8.0.0"},
  //         {purl: "pkg:npm/is-fullwidth-code-point", requirement: "2.0.0"},
  //         {purl: "pkg:npm/locate-path", requirement: "5.0.0"},
  //         {purl: "pkg:npm/p-limit", requirement: "2.3.0"},
  //         {purl: "pkg:npm/p-locate", requirement: "4.1.0"},
  //         {purl: "pkg:npm/p-try", requirement: "2.2.0"},
  //         {purl: "pkg:npm/path-exists", requirement: "4.0.0"},
  //         {purl: "pkg:npm/require-directory", requirement: "2.1.1"},
  //         {purl: "pkg:npm/require-main-filename", requirement: "2.0.0"},
  //         {purl: "pkg:npm/set-blocking", requirement: "2.0.0"},
  //         {purl: "pkg:npm/string-width", requirement: "2.1.1"},
  //         {purl: "pkg:npm/strip-ansi", requirement: "4.0.0"},
  //         {purl: "pkg:npm/strip-final-newline", requirement: "2.0.0"},
  //         {purl: "pkg:npm/which-module", requirement: "2.0.0"},
  //         {purl: "pkg:npm/wrap-ansi", requirement: "6.2.0"},
  //         {purl: "pkg:npm/ansi-regex", requirement: "5.0.1"},
  //         {purl: "pkg:npm/is-fullwidth-code-point", requirement: "3.0.0"},
  //         {purl: "pkg:npm/string-width", requirement: "4.2.3"},
  //         {purl: "pkg:npm/strip-ansi", requirement: "6.0.1"},
  //         {purl: "pkg:npm/y18n", requirement: "4.0.3"},
  //         {purl: "pkg:npm/yargs", requirement: "15.4.1"},
  //         {purl: "pkg:npm/yargs-parser", requirement: "18.1.3"},
  //         {purl: "pkg:npm/ansi-regex", requirement: "5.0.1"},
  //         {purl: "pkg:npm/is-fullwidth-code-point", requirement: "3.0.0"},
  //         {purl: "pkg:npm/string-width", requirement: "4.2.3"},
  //         {purl: "pkg:npm/strip-ansi", requirement: "6.0.1"}
  //       ]}
  //   }];
  //
  //   for (const test of tests) {
  //     const fileContent = fs.readFileSync(test.inputPath,  {encoding:'utf-8'});
  //     const result = packagelockParser(fileContent, 'package-lock.json');
  //     expect(test.expectedResult).to.deep.equal(result)
  //   }
  // });


  it('Testing invalid package-lock.json', async function () {
    const packageLock = {
      name: "broken",
      version: "1.0.0",
      lockfileVersion: 2,
      requires: true,
      packages: {
        "": {},
      }
    };

    const outputExpected: ILocalDependency = {file: 'package-lock.json', purls: []};
    const deps = await packagelockParser(JSON.stringify(packageLock), 'package-lock.json')
    expect(outputExpected).to.deep.equal(deps)
  });


  it('Testing invalid name', async function () {
    const outputExpected: ILocalDependency = {file: '.json', purls: []};
    const deps = await packagelockParser(JSON.stringify({}), '.json')
    expect(outputExpected).to.deep.equal(deps)
  });


  it('Testing broken JSON', async function () {
    const emptyPackageLock = "{}" ;
    const outputExpected: ILocalDependency = {file: 'package-lock.json', purls: []};
    const deps = await packagelockParser(JSON.stringify(emptyPackageLock), 'package-lock.json')
    expect(outputExpected).to.deep.equal(deps)
  });

  it('Testing broken JSON', async function () {
    const emptyPackageLock = "{{asddsasdasaddsa,.,..,00045g{}" ;
    const outputExpected: ILocalDependency = {file: 'package-lock.json', purls: []};
    const deps = await packagelockParser(JSON.stringify(emptyPackageLock), 'package-lock.json')
    expect(outputExpected).to.deep.equal(deps)
  });

});


// Command used to generate the expected output
// scancode --json-pp - --package yarn.lock | jq -c '.files[0].packages[0].dependencies[] | { "purl": .purl , "requirement": .requirement }'
describe('Suit test for yarn lock files', function() {

  it('Testing yarn lock file v1', async function() {
    const expectedOutput = JSON.parse(fs.readFileSync(path.join(__dirname, "./samples/yarn-lock/v1/yarn.lock-expected"), 'utf-8'));
    const yarnLock = fs.readFileSync(path.join(__dirname, "./samples/yarn-lock/v1/yarn.lock"), 'utf-8');
    const results = await yarnLockParser(yarnLock, 'yarn.lock');
    expect(results).to.be.deep.equal(expectedOutput)
  });

  it('Testing yarn lock file v1 complex', async function() {
    const expectedOutput = JSON.parse(fs.readFileSync(path.join(__dirname, './samples/yarn-lock/v1-complex/yarn.lock-expected'), 'utf-8'));
    const yarnLock = fs.readFileSync(path.join(__dirname, './samples/yarn-lock/v1-complex/yarn.lock'), 'utf-8');
    const results = await yarnLockParser(yarnLock, 'yarn.lock');
    expect(results).to.be.deep.equal(expectedOutput)
  });

  it('Testing yarn lock file v1_2', async function() {
    const expectedOutput = JSON.parse(fs.readFileSync(path.join(__dirname, './samples/yarn-lock/v1_2/yarn.lock-expected'), 'utf-8'));
    const yarnLock = fs.readFileSync(path.join(__dirname, './samples/yarn-lock/v1_2/yarn.lock'), 'utf-8');
    const results = await yarnLockParser(yarnLock, 'yarn.lock');
    expect(results).to.be.deep.equal(expectedOutput)
  });

});
