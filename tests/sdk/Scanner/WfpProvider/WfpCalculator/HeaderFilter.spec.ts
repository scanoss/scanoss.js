import { expect } from 'chai';
import fs from 'fs';
import { HeaderFilter, stripLinesUntilOffset } from '../../../../../src/sdk/scanner/WfpProvider/WfpCalculator/HeaderFilter';

describe('HeaderFilter', () => {

  describe('detectLanguage()', () => {
    let filter: HeaderFilter;

    beforeEach(() => {
      filter = new HeaderFilter();
    });

    it('should detect C/C++ language from .c extension', () => {
      expect(filter.detectLanguage('test.c')).to.equal('cpp');
    });

    it('should detect C/C++ language from .h extension', () => {
      expect(filter.detectLanguage('test.h')).to.equal('cpp');
    });

    it('should detect JavaScript from .js extension', () => {
      expect(filter.detectLanguage('test.js')).to.equal('javascript');
    });

    it('should detect TypeScript from .ts extension', () => {
      expect(filter.detectLanguage('test.ts')).to.equal('typescript');
    });

    it('should detect Python from .py extension', () => {
      expect(filter.detectLanguage('test.py')).to.equal('python');
    });

    it('should detect Go from .go extension', () => {
      expect(filter.detectLanguage('test.go')).to.equal('go');
    });

    it('should detect Java from .java extension', () => {
      expect(filter.detectLanguage('test.java')).to.equal('java');
    });

    it('should detect Rust from .rs extension', () => {
      expect(filter.detectLanguage('test.rs')).to.equal('rust');
    });

    it('should return null for unsupported extensions', () => {
      expect(filter.detectLanguage('test.xyz')).to.be.null;
    });

    it('should return null for files without extension', () => {
      expect(filter.detectLanguage('Makefile')).to.be.null;
    });

    it('should handle case-insensitive extensions', () => {
      expect(filter.detectLanguage('test.PY')).to.equal('python');
    });
  });

  describe('filter()', () => {
    let filter: HeaderFilter;

    beforeEach(() => {
      filter = new HeaderFilter();
    });

    it('should return 0 for empty content', () => {
      expect(filter.filter('test.c', '')).to.equal(0);
    });

    it('should return 0 for empty file path', () => {
      expect(filter.filter('', 'int main() {}')).to.equal(0);
    });

    it('should return 0 for unsupported language', () => {
      expect(filter.filter('test.xyz', 'some content')).to.equal(0);
    });

    it('should return 0 for file with no header', () => {
      const content = fs.readFileSync(__dirname + '/samples/no_header_file.c', 'utf-8');
      expect(filter.filter('no_header_file.c', content)).to.equal(0);
    });

    it('should detect C license header and includes', () => {
      const content = fs.readFileSync(__dirname + '/samples/header_c_file.c', 'utf-8');
      const offset = filter.filter('header_c_file.c', content);
      // Lines 1-9: multi-line license comment
      // Line 10: blank
      // Lines 11-13: #include statements
      // Line 14: blank
      // Line 15: first implementation line (int main...)
      // offset = 15 - 1 = 14
      expect(offset).to.equal(14);
    });

    it('should detect JavaScript comment header and imports', () => {
      const content = fs.readFileSync(__dirname + '/samples/header_js_file.js', 'utf-8');
      const offset = filter.filter('header_js_file.js', content);
      // Lines 1-2: single-line license comments
      // Line 3: blank
      // Lines 4-5: import statements
      // Line 6: blank
      // Line 7: first implementation line (function readFile...)
      expect(offset).to.equal(6);
    });

    it('should detect Python shebang, comments, and imports', () => {
      const content = fs.readFileSync(__dirname + '/samples/header_py_file.py', 'utf-8');
      const offset = filter.filter('header_py_file.py', content);
      // Line 1: shebang
      // Lines 2-7: license comments
      // Line 8: blank
      // Lines 9-11: import statements
      // Line 12: blank
      // Line 13: first implementation line (def main...)
      expect(offset).to.equal(12);
    });

    it('should detect Go header with import block', () => {
      const content = fs.readFileSync(__dirname + '/samples/header_go_file.go', 'utf-8');
      const offset = filter.filter('header_go_file.go', content);
      // Lines 1-2: license comments
      // Line 3: blank
      // Line 4: package declaration
      // Line 5: blank
      // Lines 6-9: import block (import ( ... ))
      // Line 10: blank
      // Line 11: first implementation line (func main...)
      expect(offset).to.equal(10);
    });
  });

  describe('filter() with skip_headers_limit', () => {
    it('should cap line offset at skip_headers_limit', () => {
      const filter = new HeaderFilter(5);
      const content = fs.readFileSync(__dirname + '/samples/header_c_file.c', 'utf-8');
      const offset = filter.filter('header_c_file.c', content);
      // Without limit would be 15, but capped at 5
      expect(offset).to.equal(5);
    });

    it('should not cap when limit is greater than offset', () => {
      const filter = new HeaderFilter(100);
      const content = fs.readFileSync(__dirname + '/samples/header_c_file.c', 'utf-8');
      const offset = filter.filter('header_c_file.c', content);
      expect(offset).to.equal(14);
    });

    it('should not cap when limit is 0 (no limit)', () => {
      const filter = new HeaderFilter(0);
      const content = fs.readFileSync(__dirname + '/samples/header_c_file.c', 'utf-8');
      const offset = filter.filter('header_c_file.c', content);
      expect(offset).to.equal(14);
    });
  });

  describe('findFirstImplementationLine()', () => {
    let filter: HeaderFilter;

    beforeEach(() => {
      filter = new HeaderFilter();
    });

    it('should return null for empty lines', () => {
      expect(filter.findFirstImplementationLine([], 'cpp')).to.be.null;
    });

    it('should return 1 for code on first line', () => {
      const lines = ['int main() {}'];
      expect(filter.findFirstImplementationLine(lines, 'cpp')).to.equal(1);
    });

    it('should skip single-line C comments', () => {
      const lines = [
        '// This is a comment',
        'int main() {}',
      ];
      expect(filter.findFirstImplementationLine(lines, 'cpp')).to.equal(2);
    });

    it('should skip multi-line C comments', () => {
      const lines = [
        '/* Start of comment',
        ' * Middle of comment',
        ' */',
        'int main() {}',
      ];
      expect(filter.findFirstImplementationLine(lines, 'cpp')).to.equal(4);
    });

    it('should skip Python comments', () => {
      const lines = [
        '# This is a comment',
        '# Another comment',
        'def main():',
      ];
      expect(filter.findFirstImplementationLine(lines, 'python')).to.equal(3);
    });

    it('should skip shebang line', () => {
      const lines = [
        '#!/usr/bin/env python3',
        'def main():',
      ];
      expect(filter.findFirstImplementationLine(lines, 'python')).to.equal(2);
    });

    it('should skip blank lines', () => {
      const lines = [
        '',
        '',
        'int main() {}',
      ];
      expect(filter.findFirstImplementationLine(lines, 'cpp')).to.equal(3);
    });

    it('should skip import statements', () => {
      const lines = [
        'import os',
        'import sys',
        '',
        'def main():',
      ];
      expect(filter.findFirstImplementationLine(lines, 'python')).to.equal(4);
    });

    it('should skip JavaScript require statements', () => {
      const lines = [
        "const fs = require('fs');",
        "const path = require('path');",
        '',
        'function main() {}',
      ];
      expect(filter.findFirstImplementationLine(lines, 'javascript')).to.equal(4);
    });

    it('should skip C #include directives', () => {
      const lines = [
        '#include <stdio.h>',
        '#include <stdlib.h>',
        '',
        'int main() {}',
      ];
      expect(filter.findFirstImplementationLine(lines, 'cpp')).to.equal(4);
    });

    it('should skip Go import blocks', () => {
      const lines = [
        'package main',
        '',
        'import (',
        '	"fmt"',
        '	"os"',
        ')',
        '',
        'func main() {}',
      ];
      expect(filter.findFirstImplementationLine(lines, 'go')).to.equal(8);
    });

    it('should return null when file has only headers', () => {
      const lines = [
        '// License comment',
        '// Copyright notice',
        '#include <stdio.h>',
      ];
      expect(filter.findFirstImplementationLine(lines, 'cpp')).to.be.null;
    });

    it('should handle Python docstrings', () => {
      const lines = [
        '"""',
        'Module docstring',
        '"""',
        '',
        'def main():',
      ];
      expect(filter.findFirstImplementationLine(lines, 'python')).to.equal(5);
    });

    it('should handle single-line Python docstrings', () => {
      const lines = [
        '"""Module docstring"""',
        '',
        'def main():',
      ];
      expect(filter.findFirstImplementationLine(lines, 'python')).to.equal(3);
    });
  });
});

describe('stripLinesUntilOffset', () => {
  it('should return original WFP when offset is 0', () => {
    const wfp = 'file=abc123,100,test.c\n8=c0e39912\n';
    expect(stripLinesUntilOffset(wfp, 0)).to.equal(wfp);
  });

  it('should return original WFP when offset is negative', () => {
    const wfp = 'file=abc123,100,test.c\n8=c0e39912\n';
    expect(stripLinesUntilOffset(wfp, -1)).to.equal(wfp);
  });

  it('should strip snippet lines up to offset', () => {
    const wfp = [
      'file=abc123,100,test.c',
      'fh2=def456',
      '3=aaa11111',
      '5=bbb22222',
      '10=ccc33333',
      '15=ddd44444',
      '',
    ].join('\n');

    const result = stripLinesUntilOffset(wfp, 7);

    expect(result).to.include('file=abc123,100,test.c');
    expect(result).to.include('fh2=def456');
    expect(result).to.not.include('3=aaa11111');
    expect(result).to.not.include('5=bbb22222');
    expect(result).to.include('start_line=7');
    expect(result).to.include('10=ccc33333');
    expect(result).to.include('15=ddd44444');
  });

  it('should preserve non-snippet lines', () => {
    const wfp = [
      'file=abc123,100,test.c',
      'fh2=def456',
      'hpsm=91ffe7ff',
      '3=aaa11111',
      '10=ccc33333',
      '',
    ].join('\n');

    const result = stripLinesUntilOffset(wfp, 5);

    expect(result).to.include('file=abc123,100,test.c');
    expect(result).to.include('fh2=def456');
    expect(result).to.include('hpsm=91ffe7ff');
    expect(result).to.not.include('3=aaa11111');
    expect(result).to.include('start_line=5');
    expect(result).to.include('10=ccc33333');
  });

  it('should insert start_line tag before first kept snippet line', () => {
    const wfp = [
      'file=abc123,100,test.c',
      '2=aaa11111',
      '5=bbb22222',
      '10=ccc33333',
      '',
    ].join('\n');

    const result = stripLinesUntilOffset(wfp, 3);
    const lines = result.split('\n');

    const startLineIndex = lines.findIndex(l => l.startsWith('start_line='));
    const firstSnippetIndex = lines.findIndex(l => l === '5=bbb22222');

    expect(startLineIndex).to.be.greaterThan(-1);
    expect(startLineIndex).to.be.lessThan(firstSnippetIndex);
    expect(lines[startLineIndex]).to.equal('start_line=3');
  });

  it('should strip all snippet lines when offset exceeds all line numbers', () => {
    const wfp = [
      'file=abc123,100,test.c',
      'fh2=def456',
      '3=aaa11111',
      '5=bbb22222',
      '',
    ].join('\n');

    const result = stripLinesUntilOffset(wfp, 100);

    expect(result).to.include('file=abc123,100,test.c');
    expect(result).to.include('fh2=def456');
    expect(result).to.not.include('3=aaa11111');
    expect(result).to.not.include('5=bbb22222');
    expect(result).to.not.include('start_line=');
  });

  it('should not insert start_line when no snippet lines are kept', () => {
    const wfp = [
      'file=abc123,100,test.c',
      '3=aaa11111',
      '',
    ].join('\n');

    const result = stripLinesUntilOffset(wfp, 10);
    expect(result).to.not.include('start_line=');
  });
});