import { expect } from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getSettingsFilePath, DEFAULT_SETTINGS_FILE } from './helpers';

describe('Suit test for CLI helpers', () => {

  describe('getSettingsFilePath', () => {

    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scanoss-helpers-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('Returns the explicit settings path when provided', async () => {
      const explicitPath = '/some/path/scanoss.json';
      const result = await getSettingsFilePath(explicitPath, tmpDir);
      expect(result).to.equal(explicitPath);
    });

    it('Finds the default settings file in a scanned directory', async () => {
      const settingsFile = path.join(tmpDir, DEFAULT_SETTINGS_FILE);
      fs.writeFileSync(settingsFile, '{}');
      const result = await getSettingsFilePath(null, tmpDir);
      expect(result).to.equal(settingsFile);
    });

    it('Returns null when the scanned directory has no settings file', async () => {
      const result = await getSettingsFilePath(null, tmpDir);
      expect(result).to.equal(null);
    });

    it('Does not throw ENOTDIR when scanning a single file', async () => {
      const scannedFile = path.join(tmpDir, 'user-agreement.pdf');
      fs.writeFileSync(scannedFile, 'dummy content');
      const result = await getSettingsFilePath(null, scannedFile);
      expect(result).to.equal(null);
    });

    it('Finds the default settings file next to a scanned single file', async () => {
      const scannedFile = path.join(tmpDir, 'user-agreement.pdf');
      fs.writeFileSync(scannedFile, 'dummy content');
      const settingsFile = path.join(tmpDir, DEFAULT_SETTINGS_FILE);
      fs.writeFileSync(settingsFile, '{}');
      const result = await getSettingsFilePath(null, scannedFile);
      expect(result).to.equal(settingsFile);
    });

  });

});
