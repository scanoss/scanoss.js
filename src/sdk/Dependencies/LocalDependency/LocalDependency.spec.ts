import path from 'path';
import { LocalDependencies } from './LocalDependency';
import { assert, expect } from 'chai';

describe('Suit test for LocalDependency Scanner', () => {

  it('Testing wildcard string matching',  function () {
    const localDependencyScanner = new LocalDependencies();
    assert(localDependencyScanner.stringMatchWithWildcard("hello this is a test", "hello*"));
    assert(localDependencyScanner.stringMatchWithWildcard("hello this is a test", "*hello*"));
    assert(localDependencyScanner.stringMatchWithWildcard("hello this is a test", "*"));
    assert(localDependencyScanner.stringMatchWithWildcard("hello this is a test", "*this*"));
    assert(localDependencyScanner.stringMatchWithWildcard("/home/user/projname.cproj", "*.cproj"));
    assert(!localDependencyScanner.stringMatchWithWildcard("this text should no match", "*hello*"));
    assert(!localDependencyScanner.stringMatchWithWildcard("/home/user/projname.cproj", "*hello"));
  });



  it('Testing filepath filter function',  function () {
    const localDependencyScanner = new LocalDependencies();
    const files = [
      "/home/user/ignore.c",
      "/home/user/go.sum",
      "/home/user/accept.csproj",
      "/home/user/ignore2.c",
      "/home/user/app/build.gradle.kts",
      "/home/user/gradle/libs.versions.toml",
    ];

    const expectedOut = [
      "/home/user/go.sum",
      "/home/user/accept.csproj",
      "/home/user/app/build.gradle.kts",
      "/home/user/gradle/libs.versions.toml",
    ];

    const result = localDependencyScanner.filterFiles(files);

    for (let i=0; i<result.length;i++){
      expect(expectedOut[i]).to.be.equal(result[i]);
    }
  });

  describe('Catalog alias resolution integration (search)', () => {
    const fixtureDir = path.resolve(__dirname, 'testdata', 'gradle-catalog');
    const tomlPath = path.join(fixtureDir, 'gradle', 'libs.versions.toml');
    const ktsPath = path.join(fixtureDir, 'app', 'build.gradle.kts');

    it('resolves catalog aliases when TOML and .kts are both in the file list', async function () {
      const ld = new LocalDependencies();
      const result = await ld.search([tomlPath, ktsPath]);

      // TOML file produces its own purls
      const tomlFile = result.files.find(f => f.file === tomlPath);
      expect(tomlFile).to.not.be.undefined;
      expect(tomlFile.purls.length).to.equal(3);

      // .kts file should have 4 purls: 3 catalog aliases + 1 direct coordinate
      const ktsFile = result.files.find(f => f.file === ktsPath);
      expect(ktsFile).to.not.be.undefined;
      expect(ktsFile.purls.length).to.equal(4);

      // Catalog-resolved entries should have correct coordinates and scope
      const hilt = ktsFile.purls.find(p => p.purl.includes('hilt-android'));
      expect(hilt).to.not.be.undefined;
      expect(hilt.purl).to.equal('pkg:maven/com.google.dagger/hilt-android');
      expect(hilt.scope).to.equal('implementation');
      expect(hilt.requirement).to.equal('2.48');

      const junit = ktsFile.purls.find(p => p.purl.includes('junit'));
      expect(junit).to.not.be.undefined;
      expect(junit.purl).to.equal('pkg:maven/junit/junit');
      expect(junit.scope).to.equal('testImplementation');
      expect(junit.requirement).to.equal('4.13.2');

      const coreKtx = ktsFile.purls.find(p => p.purl.includes('core-ktx'));
      expect(coreKtx).to.not.be.undefined;
      expect(coreKtx.purl).to.equal('pkg:maven/androidx.core/core-ktx');
      expect(coreKtx.scope).to.equal('implementation');
      expect(coreKtx.requirement).to.equal('1.12.0');

      // Direct coordinate should also resolve with scope
      const retrofit = ktsFile.purls.find(p => p.purl.includes('retrofit'));
      expect(retrofit).to.not.be.undefined;
      expect(retrofit.purl).to.equal('pkg:maven/com.squareup.retrofit2/retrofit');
      expect(retrofit.scope).to.equal('implementation');
      expect(retrofit.requirement).to.equal('2.9.0');
    });

    it('produces only direct coordinates when no TOML is available', async function () {
      const ld = new LocalDependencies();
      // Only pass .kts with no TOML on disk at any ancestor directory
      // Use a standalone .kts in a temp-like path where no libs.versions.toml exists
      const standaloneKts = path.join(fixtureDir, 'app', 'build.gradle.kts');

      // Create a copy of the fixture in a location with no TOML ancestor
      const fs = await import('fs');
      const os = await import('os');
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gradle-no-toml-'));
      const tmpKts = path.join(tmpDir, 'build.gradle.kts');
      fs.copyFileSync(standaloneKts, tmpKts);

      try {
        const result = await ld.search([tmpKts]);
        const ktsFile = result.files.find(f => f.file === tmpKts);
        expect(ktsFile).to.not.be.undefined;
        // Only the direct coordinate should resolve (catalog aliases have no TOML to resolve against)
        expect(ktsFile.purls.length).to.equal(1);
        expect(ktsFile.purls[0].purl).to.equal('pkg:maven/com.squareup.retrofit2/retrofit');
        expect(ktsFile.purls[0].scope).to.equal('implementation');
      } finally {
        fs.unlinkSync(tmpKts);
        fs.rmdirSync(tmpDir);
      }
    });

    describe('Multi-module catalog resolution', () => {
      const multiDir = path.resolve(__dirname, 'testdata', 'gradle-catalog-multimodule');
      const rootToml = path.join(multiDir, 'gradle', 'libs.versions.toml');
      const moduleAToml = path.join(multiDir, 'moduleA', 'gradle', 'libs.versions.toml');
      const moduleAKts = path.join(multiDir, 'moduleA', 'build.gradle.kts');
      const moduleBKts = path.join(multiDir, 'moduleB', 'build.gradle.kts');

      it('each .kts resolves from its nearest TOML when all files are in the list', async function () {
        const ld = new LocalDependencies();
        const result = await ld.search([rootToml, moduleAToml, moduleAKts, moduleBKts]);

        // moduleA should resolve hilt-android from moduleA's own TOML
        const moduleAFile = result.files.find(f => f.file === moduleAKts);
        expect(moduleAFile).to.not.be.undefined;
        expect(moduleAFile.purls.length).to.equal(1);
        const hilt = moduleAFile.purls.find(p => p.purl.includes('hilt-android'));
        expect(hilt).to.not.be.undefined;
        expect(hilt.purl).to.equal('pkg:maven/com.google.dagger/hilt-android');
        expect(hilt.scope).to.equal('implementation');
        expect(hilt.requirement).to.equal('2.48');

        // moduleB should resolve retrofit from root TOML (walks up past moduleB/ to root)
        const moduleBFile = result.files.find(f => f.file === moduleBKts);
        expect(moduleBFile).to.not.be.undefined;
        expect(moduleBFile.purls.length).to.equal(1);
        const retrofit = moduleBFile.purls.find(p => p.purl.includes('retrofit'));
        expect(retrofit).to.not.be.undefined;
        expect(retrofit.purl).to.equal('pkg:maven/com.squareup.retrofit2/retrofit');
        expect(retrofit.scope).to.equal('implementation');
        expect(retrofit.requirement).to.equal('2.9.0');

        // No cross-contamination: moduleA should NOT have retrofit, moduleB should NOT have hilt
        expect(moduleAFile.purls.find(p => p.purl.includes('retrofit'))).to.be.undefined;
        expect(moduleBFile.purls.find(p => p.purl.includes('hilt'))).to.be.undefined;
      });

    });
  });

});
