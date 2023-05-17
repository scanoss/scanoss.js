import fs from 'fs';
import path from 'path';
import { FingerprintPackage } from '../../../../src/sdk/scanner/WfpProvider/FingerprintPackage';

import * as assert from 'assert';

describe('Suit test for FingerprintPackage', () => {

  it('Test getFilesFingerprinted function, should get all the file paths from a wfp file', async function () {

    const wfp = fs.readFileSync(path.join(__dirname, '/wfp.wfp'), 'utf-8');
    const fingerprintPackage = new FingerprintPackage(wfp);

    let expected = [
      'node_modules/@types/node/fs.d.ts',
      'node_modules/@types/node/globals.d.ts',
      'node_modules/@types/node/globals.global.d.ts',
      'node_modules/@types/node/http.d.ts',
      'node_modules/@types/node/ts4.8/fs.d.ts',
    ];

    const filePaths = fingerprintPackage.getFilesFingerprinted();

    filePaths.sort();
    expected.sort();

    assert.deepStrictEqual(filePaths, expected);

  });


  it('Wfp should not contains original paths', async function () {

    const wfp = fs.readFileSync(path.join(__dirname, '/wfp.wfp'), 'utf-8');
    const fingerprintPackage = new FingerprintPackage(wfp);

    const originalFilePaths = fingerprintPackage.getFilesFingerprinted();
    const obfuscatedRecord = fingerprintPackage.obfuscate();
    const obfuscatedFilePaths  = fingerprintPackage.getFilesFingerprinted();

    originalFilePaths.forEach((filePath) => {
      for (let obfuscatedfilePath of obfuscatedFilePaths) {
        assert.strict.notStrictEqual(obfuscatedfilePath, filePath);
      }
    });

    assert.equal(Object.keys(obfuscatedRecord).length, originalFilePaths.length)
    assert.equal(originalFilePaths.length, obfuscatedFilePaths.length)

  });

});


