// SPDX-License-Identifier: MIT
// Copyright (c) 2025, SCANOSS

import path from 'path';

const COMPLETE_DOCSTRING_QUOTE_COUNT = 2;
const LICENSE_HEADER_MAX_LINES = 50;

interface CommentPatterns {
  single_line?: string;
  multi_start?: string;
  multi_end?: string;
  multi_single?: string;
  doc_string_start?: string;
  doc_string_end?: string;
}

const COMMENT_PATTERNS: Record<string, CommentPatterns> = {
  c_style: {
    single_line: String.raw`^\s*//.*$`,
    multi_start: String.raw`^\s*/\*`,
    multi_end: String.raw`\*/\s*$`,
    multi_single: String.raw`^\s*/\*.*\*/\s*$`,
  },
  python_style: {
    single_line: String.raw`^\s*#.*$`,
    doc_string_start: String.raw`^\s*"""`,
    doc_string_end: String.raw`"""\s*$`,
  },
  lua_style: {
    single_line: String.raw`^\s*--.*$`,
    multi_start: String.raw`^\s*--\[\[`,
    multi_end: String.raw`\]\]\s*$`,
  },
  html_style: {
    multi_start: String.raw`^\s*<!--`,
    multi_end: String.raw`-->\s*$`,
    multi_single: String.raw`^\s*<!--.*-->\s*$`,
  },
};

const IMPORT_PATTERNS: Record<string, string[]> = {
  python: [String.raw`^\s*import\s+`, String.raw`^\s*from\s+.*\s+import\s+`],
  javascript: [
    String.raw`^\s*import\s+.*\s+from\s+`,
    String.raw`^\s*import\s+['"]`,
    String.raw`^\s*import\s+type\s+`,
    String.raw`^\s*export\s+\*\s+from\s+`,
    String.raw`^\s*export\s+\{.*\}\s+from\s+`,
    String.raw`^\s*const\s+.*\s*=\s*require\(`,
    String.raw`^\s*var\s+.*\s*=\s*require\(`,
    String.raw`^\s*let\s+.*\s*=\s*require\(`,
  ],
  typescript: [
    String.raw`^\s*import\s+`,
    String.raw`^\s*export\s+.*\s+from\s+`,
    String.raw`^\s*import\s+type\s+`,
    String.raw`^\s*import\s+\{.*\}\s+from\s+`,
  ],
  java: [String.raw`^\s*import\s+`, String.raw`^\s*package\s+`],
  kotlin: [String.raw`^\s*import\s+`, String.raw`^\s*package\s+`],
  scala: [String.raw`^\s*import\s+`, String.raw`^\s*package\s+`],
  go: [
    String.raw`^\s*import\s+\(`,
    String.raw`^\s*import\s+"`,
    String.raw`^\s*package\s+`,
    String.raw`^\s*"[^"]*"\s*$`,
    String.raw`^\s*[a-zA-Z_][a-zA-Z0-9_]*\s+"[^"]*"\s*$`,
    String.raw`^\s*_\s+"[^"]*"\s*$`,
  ],
  rust: [String.raw`^\s*use\s+`, String.raw`^\s*extern\s+crate\s+`, String.raw`^\s*mod\s+`],
  cpp: [
    String.raw`^\s*#include\s+`,
    String.raw`^\s*#pragma\s+`,
    String.raw`^\s*#ifndef\s+.*_H.*`,
    String.raw`^\s*#define\s+.*_H.*`,
    String.raw`^\s*#endif\s+(//.*)?\s*$`,
  ],
  csharp: [String.raw`^\s*using\s+`, String.raw`^\s*namespace\s+`],
  php: [
    String.raw`^\s*use\s+`,
    String.raw`^\s*require\s+`,
    String.raw`^\s*require_once\s+`,
    String.raw`^\s*include\s+`,
    String.raw`^\s*include_once\s+`,
    String.raw`^\s*namespace\s+`,
  ],
  swift: [String.raw`^\s*import\s+`],
  ruby: [String.raw`^\s*require\s+`, String.raw`^\s*require_relative\s+`, String.raw`^\s*load\s+`],
  perl: [String.raw`^\s*use\s+`, String.raw`^\s*require\s+`],
  r: [String.raw`^\s*library\(`, String.raw`^\s*require\(`, String.raw`^\s*source\(`],
  lua: [String.raw`^\s*require\s+`, String.raw`^\s*local\s+.*\s*=\s*require\(`],
  dart: [String.raw`^\s*import\s+`, String.raw`^\s*export\s+`, String.raw`^\s*part\s+`],
  haskell: [String.raw`^\s*import\s+`, String.raw`^\s*module\s+`],
  elixir: [
    String.raw`^\s*import\s+`,
    String.raw`^\s*alias\s+`,
    String.raw`^\s*require\s+`,
    String.raw`^\s*use\s+`,
  ],
  clojure: [
    String.raw`^\s*\(\s*ns\s+`,
    String.raw`^\s*\(\s*require\s+`,
    String.raw`^\s*\(\s*import\s+`,
  ],
};

const LICENSE_KEYWORDS = [
  'copyright', 'license', 'licensed', 'all rights reserved',
  'permission', 'redistribution', 'warranty', 'liability',
  'apache', 'mit', 'gpl', 'bsd', 'mozilla', 'author:',
  'spdx-license', 'contributors', 'licensee',
];

const EXT_MAP: Record<string, string> = {
  '.py': 'python', '.js': 'javascript', '.mjs': 'javascript',
  '.cjs': 'javascript', '.ts': 'typescript', '.tsx': 'typescript',
  '.jsx': 'javascript', '.java': 'java', '.kt': 'kotlin',
  '.kts': 'kotlin', '.scala': 'scala', '.sc': 'scala',
  '.go': 'go', '.rs': 'rust', '.cpp': 'cpp', '.cc': 'cpp',
  '.cxx': 'cpp', '.c': 'cpp', '.h': 'cpp', '.hpp': 'cpp',
  '.hxx': 'cpp', '.cs': 'csharp', '.php': 'php', '.swift': 'swift',
  '.rb': 'ruby', '.pl': 'perl', '.pm': 'perl', '.r': 'r', '.R': 'r',
  '.lua': 'lua', '.dart': 'dart', '.hs': 'haskell', '.ex': 'elixir',
  '.exs': 'elixir', '.clj': 'clojure', '.cljs': 'clojure',
  '.m': 'cpp', '.mm': 'cpp', '.sh': 'python', '.bash': 'python',
  '.zsh': 'python', '.fish': 'python',
};

function isBlankLine(stripped: string): boolean {
  return stripped.length === 0;
}

function isShebang(stripped: string): boolean {
  return stripped.startsWith('#!');
}

export class HeaderFilter {
  private maxLines: number | null;

  constructor(skipLimit?: number) {
    this.maxLines = skipLimit != null && skipLimit > 0 ? skipLimit : null;
  }

  filter(file: string, decodedContents: string): number {
    if (!decodedContents || !file) {
      return 0;
    }

    const language = this.detectLanguage(file);
    if (!language) {
      return 0;
    }

    const lines = decodedContents.split(/\r?\n/);
    if (lines.length === 0) {
      return 0;
    }

    const implementationStart = this.findFirstImplementationLine(lines, language);
    if (implementationStart === null) {
      return 0;
    }

    let lineOffset = implementationStart - 1;

    if (this.maxLines !== null && this.maxLines > 0 && this.maxLines < lineOffset) {
      lineOffset = this.maxLines;
    }

    return lineOffset;
  }

  detectLanguage(filePath: string): string | null {
    const ext = path.extname(filePath).toLowerCase();
    if (!ext) return null;
    return EXT_MAP[ext] || null;
  }

  private getCommentStyle(language: string): string {
    const cStyleLanguages = [
      'cpp', 'java', 'kotlin', 'scala', 'javascript', 'typescript',
      'go', 'rust', 'csharp', 'php', 'swift', 'dart',
    ];
    const pythonStyleLanguages = ['python', 'ruby', 'perl', 'r'];
    const luaStyleLanguages = ['lua', 'haskell'];

    if (cStyleLanguages.includes(language)) return 'c_style';
    if (pythonStyleLanguages.includes(language)) return 'python_style';
    if (luaStyleLanguages.includes(language)) return 'lua_style';
    return 'c_style';
  }

  private isLicenseHeader(line: string): boolean {
    const lineLower = line.toLowerCase();
    return LICENSE_KEYWORDS.some(keyword => lineLower.includes(keyword));
  }

  private isComment(line: string, inMultiline: boolean, patterns: CommentPatterns): [boolean, boolean] {
    if (!patterns) return [false, inMultiline];

    if (inMultiline) {
      if (patterns.multi_end && new RegExp(patterns.multi_end).test(line)) {
        return [true, false];
      }
      if (patterns.doc_string_end && new RegExp(patterns.doc_string_end).test(line)) {
        return [true, false];
      }
      return [true, true];
    }

    if (patterns.single_line && new RegExp(patterns.single_line).test(line)) {
      return [true, false];
    }

    if (patterns.multi_single && new RegExp(patterns.multi_single).test(line)) {
      return [true, false];
    }

    if (patterns.multi_start && new RegExp(patterns.multi_start).test(line)) {
      if (patterns.multi_end && new RegExp(patterns.multi_end).test(line)) {
        return [true, false];
      }
      return [true, true];
    }

    if (patterns.doc_string_start && line.includes('"""')) {
      const count = (line.match(/"""/g) || []).length;
      if (count === COMPLETE_DOCSTRING_QUOTE_COUNT) {
        return [true, false];
      }
      if (count === 1) {
        return [true, true];
      }
    }

    return [false, inMultiline];
  }

  private isImport(line: string, patterns: string[]): boolean {
    if (!patterns) return false;
    return patterns.some(pattern => new RegExp(pattern).test(line));
  }

  findFirstImplementationLine(lines: string[], language: string): number | null {
    if (!lines.length || !language) return null;

    let inMultilineComment = false;
    let inLicenseSection = false;
    let inImportBlock = false;
    let consecutiveImportsCount = 0;

    const commentStyle = this.getCommentStyle(language);
    const commentPatterns = COMMENT_PATTERNS[commentStyle];
    const importPatterns = IMPORT_PATTERNS[language];

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const stripped = lines[i].trim();

      if ((i === 0 && isShebang(stripped)) || isBlankLine(stripped)) {
        continue;
      }

      const [isAComment, stillInMultiline] = this.isComment(lines[i], inMultilineComment, commentPatterns);
      inMultilineComment = stillInMultiline;

      if (isAComment) {
        if (this.isLicenseHeader(lines[i])) {
          inLicenseSection = true;
        } else if (inLicenseSection && lineNumber < LICENSE_HEADER_MAX_LINES) {
          // Continue within license section
        } else {
          inLicenseSection = false;
        }
        continue;
      }

      if (!isAComment) {
        inLicenseSection = false;
      }

      // Go import block handling
      if (language === 'go') {
        if (stripped.startsWith('import (')) {
          inImportBlock = true;
          continue;
        }
        if (inImportBlock) {
          if (stripped === ')') {
            inImportBlock = false;
            continue;
          }
          if (
            stripped.startsWith('"') ||
            stripped.startsWith('_') ||
            /^[a-zA-Z_][a-zA-Z0-9_]*\s+"/.test(stripped)
          ) {
            continue;
          }
        }
      }

      if (this.isImport(lines[i], importPatterns)) {
        if (consecutiveImportsCount === 0) {
          // First import detected
        }
        consecutiveImportsCount += 1;
        continue;
      }

      return lineNumber;
    }

    return null;
  }
}

/**
 * Strip WFP snippet lines up to and including the line_offset.
 * Inserts a `start_line=<offset>` tag before the first kept snippet line.
 * Preserves non-snippet lines (file=, fh2=, hpsm=, etc.).
 */
export function stripLinesUntilOffset(wfp: string, lineOffset: number): string {
  if (lineOffset <= 0) return wfp;

  const lines = wfp.split('\n');
  const filteredLines: string[] = [];
  let startLineAdded = false;

  for (const line of lines) {
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
      const prefix = line.substring(0, eqIndex);
      if (/^\d+$/.test(prefix)) {
        const lineNum = parseInt(prefix, 10);
        if (lineNum > lineOffset) {
          if (!startLineAdded) {
            filteredLines.push(`start_line=${lineOffset}`);
            startLineAdded = true;
          }
          filteredLines.push(line);
        }
        continue;
      }
    }
    filteredLines.push(line);
  }

  return filteredLines.join('\n');
}