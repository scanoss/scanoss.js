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
    ];

    const expectedOut = [
      "/home/user/go.sum",
      "/home/user/accept.csproj",
    ];

    const result = localDependencyScanner.filterFiles(files);

    for (let i=0; i<result.length;i++){
      expect(expectedOut[i]).to.be.equal(result[i]);
    }
  });

});
