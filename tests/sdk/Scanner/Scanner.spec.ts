import * as assert from 'assert';
import {
  ContentScannerInput,
  Scanner,
  ScannerInput
} from '../../../build/main';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { expect } from 'chai';

describe('Suit test for scanner', () => {

  it('Scan in memory', async function () {
    this.timeout(5000);
    const fileContent = await fs.promises.readFile(path.join(__dirname, '/WfpProvider/WfpCalculator/samples/file1.c'), 'utf-8');
    const scanner = new Scanner();
    const scannerInput: ContentScannerInput = {
      content: fileContent,
      key: "file1.c"
    };
    const results = await scanner.scanContents(scannerInput);
    assert.notEqual(Object.values(results).length, null);
    expect(results).to.be.an('object');
  });

  it('Scan in memory empty content', async function () {
    const scanner = new Scanner();
    const scannerInput: ContentScannerInput = {
      content: "",
      key: "file1.c"
    };
    const results = await scanner.scanContents(scannerInput);
    assert.equal(results, null);
  });

});
