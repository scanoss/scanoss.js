import fs from 'fs';
import { assert } from 'chai';
import path from 'path';
import { LocalDependencies } from  '../../../../src/sdk/Dependencies/LocalDependency/LocalDependency'

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

});


