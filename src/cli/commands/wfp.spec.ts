import { expect } from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { wfpHandler } from './wfp';

describe('Suit test for wfp command', () => {

  let tmpDir: string;
  let cwd: string;
  let pwd: string | undefined;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scanoss-wfp-'));
    cwd = process.cwd();
    pwd = process.env.PWD;
  });

  afterEach(() => {
    process.chdir(cwd);
    process.env.PWD = pwd;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // SP-4442: fingerprinting a single file must emit a non-empty path in the
  // file= line. Previously folderRoot was set to the file path itself, so the
  // relative-path strip produced an empty path, which the scan server rejects
  // ("no files found in .wfp content") and the C engine crashes on.
  it('Emits a non-empty file path when fingerprinting a single file', async () => {
    const sampleFile = path.join(tmpDir, 'sample.js');
    fs.writeFileSync(sampleFile, 'function hello() { return "world"; }\n');
    const outputFile = path.join(tmpDir, 'out.wfp');

    await wfpHandler(sampleFile, { output: outputFile });

    const wfp = fs.readFileSync(outputFile, 'utf-8');
    const fileLine = wfp.split('\n').find((l) => l.startsWith('file='));
    expect(fileLine, 'expected a file= line in the wfp output').to.not.be.undefined;

    // file=<md5>,<size>,<path>
    const filePath = fileLine.split(',')[2];
    expect(filePath, 'file= path should not be empty for a single file').to.equal('/sample.js');
  });

  // SP-4442: the customer ran `cd <dir> && scanoss-js wfp <name>`. A bare
  // relative filename must still resolve to a correct path, not get mangled by
  // the relative-path strip (folderRoot must be a real prefix, not ".").
  it('Emits a correct file path for a bare relative filename', async () => {
    fs.writeFileSync(path.join(tmpDir, 'jquery-1.8.1-min.js'), 'function hello() { return "world"; }\n');
    process.chdir(tmpDir);
    process.env.PWD = tmpDir;
    const outputFile = path.join(tmpDir, 'out.wfp');

    await wfpHandler('jquery-1.8.1-min.js', { output: outputFile });

    const wfp = fs.readFileSync(outputFile, 'utf-8');
    const fileLine = wfp.split('\n').find((l) => l.startsWith('file='));
    const filePath = fileLine.split(',')[2];
    expect(filePath, 'bare relative filename should not be corrupted').to.equal('/jquery-1.8.1-min.js');
  });

});
