import { expect } from 'chai';
import { ScanSettingsBuilder } from './ScanSettingsBuilder';

describe('ScanSettingsBuilder', () => {

  describe('build()', () => {
    it('should return undefined when no properties are set', () => {
      const result = new ScanSettingsBuilder().build();
      expect(result).to.be.undefined;
    });

    it('should return undefined when no CLI values and no settings file', () => {
      const result = new ScanSettingsBuilder()
        .withMinSnippetHits(undefined)
        .withMinSnippetLines(undefined)
        .withRanking(undefined)
        .withRankingThreshold(undefined)
        .withHonourFileExist(undefined)
        .build();
      expect(result).to.be.undefined;
    });
  });

  describe('Priority: settings file > CLI arguments', () => {
    it('should use settings file value when both CLI and settings file are provided', () => {
      const settingsFile = { min_snippet_hits: 5 };
      const result = new ScanSettingsBuilder(settingsFile)
        .withMinSnippetHits(10)
        .build();
      expect(result).to.deep.equal({ min_snippet_hits: 5 });
    });

    it('should use CLI value when settings file does not have the property', () => {
      const settingsFile = {};
      const result = new ScanSettingsBuilder(settingsFile)
        .withMinSnippetHits(10)
        .build();
      expect(result).to.deep.equal({ min_snippet_hits: 10 });
    });

    it('should use CLI value when no settings file is provided', () => {
      const result = new ScanSettingsBuilder()
        .withMinSnippetHits(10)
        .build();
      expect(result).to.deep.equal({ min_snippet_hits: 10 });
    });
  });

  describe('withMinSnippetHits()', () => {
    it('should set min_snippet_hits from CLI value', () => {
      const result = new ScanSettingsBuilder().withMinSnippetHits(3).build();
      expect(result).to.deep.equal({ min_snippet_hits: 3 });
    });

    it('should not set when CLI value is 0 (defer to server)', () => {
      const result = new ScanSettingsBuilder().withMinSnippetHits(0).build();
      expect(result).to.be.undefined;
    });

    it('should clamp negative values to 0', () => {
      const result = new ScanSettingsBuilder().withMinSnippetHits(-5).build();
      expect(result).to.deep.equal({ min_snippet_hits: 0 });
    });

    it('should parse string CLI values to number', () => {
      const result = new ScanSettingsBuilder().withMinSnippetHits('3').build();
      expect(result).to.deep.equal({ min_snippet_hits: 3 });
    });
  });

  describe('withMinSnippetLines()', () => {
    it('should set min_snippet_lines from CLI value', () => {
      const result = new ScanSettingsBuilder().withMinSnippetLines(5).build();
      expect(result).to.deep.equal({ min_snippet_lines: 5 });
    });

    it('should not set when CLI value is 0 (defer to server)', () => {
      const result = new ScanSettingsBuilder().withMinSnippetLines(0).build();
      expect(result).to.be.undefined;
    });

    it('should clamp negative values to 0', () => {
      const result = new ScanSettingsBuilder().withMinSnippetLines(-3).build();
      expect(result).to.deep.equal({ min_snippet_lines: 0 });
    });

    it('should parse string CLI values to number', () => {
      const result = new ScanSettingsBuilder().withMinSnippetLines('5').build();
      expect(result).to.deep.equal({ min_snippet_lines: 5 });
    });
  });

  describe('withRanking()', () => {
    it('should set ranking_enabled to true', () => {
      const result = new ScanSettingsBuilder().withRanking(true).build();
      expect(result).to.deep.equal({ ranking_enabled: true });
    });

    it('should set ranking_enabled to false', () => {
      const result = new ScanSettingsBuilder().withRanking(false).build();
      expect(result).to.deep.equal({ ranking_enabled: false });
    });

    it('should not set when CLI value is undefined', () => {
      const result = new ScanSettingsBuilder().withRanking(undefined).build();
      expect(result).to.be.undefined;
    });

    it('should prefer settings file over CLI', () => {
      const settingsFile = { ranking_enabled: false };
      const result = new ScanSettingsBuilder(settingsFile).withRanking(true).build();
      expect(result).to.deep.equal({ ranking_enabled: false });
    });

    it('should parse string "true" to boolean true', () => {
      const result = new ScanSettingsBuilder().withRanking('true').build();
      expect(result).to.deep.equal({ ranking_enabled: true });
    });

    it('should parse string "false" to boolean false', () => {
      const result = new ScanSettingsBuilder().withRanking('false').build();
      expect(result).to.deep.equal({ ranking_enabled: false });
    });
  });

  describe('withRankingThreshold()', () => {
    it('should set ranking_threshold from CLI value', () => {
      const result = new ScanSettingsBuilder().withRankingThreshold(5).build();
      expect(result).to.deep.equal({ ranking_threshold: 5 });
    });

    it('should not set when CLI value is -1 (defer to server)', () => {
      const result = new ScanSettingsBuilder().withRankingThreshold(-1).build();
      expect(result).to.be.undefined;
    });

    it('should clamp values exceeding max (10) to 10', () => {
      const result = new ScanSettingsBuilder().withRankingThreshold(15).build();
      expect(result).to.deep.equal({ ranking_threshold: 10 });
    });

    it('should clamp values below -1 to -1 and not set (defer to server)', () => {
      const result = new ScanSettingsBuilder().withRankingThreshold(-5).build();
      expect(result).to.be.undefined;
    });

    it('should accept boundary value 0', () => {
      const result = new ScanSettingsBuilder().withRankingThreshold(0).build();
      expect(result).to.deep.equal({ ranking_threshold: 0 });
    });

    it('should accept boundary value 10', () => {
      const result = new ScanSettingsBuilder().withRankingThreshold(10).build();
      expect(result).to.deep.equal({ ranking_threshold: 10 });
    });

    it('should parse string CLI values to number', () => {
      const result = new ScanSettingsBuilder().withRankingThreshold('6').build();
      expect(result).to.deep.equal({ ranking_threshold: 6 });
    });
  });

  describe('withHonourFileExist()', () => {
    it('should set honour_file_exts to true', () => {
      const result = new ScanSettingsBuilder().withHonourFileExist(true).build();
      expect(result).to.deep.equal({ honour_file_exts: true });
    });

    it('should set honour_file_exts to false', () => {
      const result = new ScanSettingsBuilder().withHonourFileExist(false).build();
      expect(result).to.deep.equal({ honour_file_exts: false });
    });

    it('should not set when CLI value is undefined', () => {
      const result = new ScanSettingsBuilder().withHonourFileExist(undefined).build();
      expect(result).to.be.undefined;
    });

    it('should parse string "true" to boolean true', () => {
      const result = new ScanSettingsBuilder().withHonourFileExist('true').build();
      expect(result).to.deep.equal({ honour_file_exts: true });
    });

    it('should parse string "false" to boolean false', () => {
      const result = new ScanSettingsBuilder().withHonourFileExist('false').build();
      expect(result).to.deep.equal({ honour_file_exts: false });
    });
  });

  describe('withDependencyAnalysis()', () => {
    it('should set dependency_analysis to true', () => {
      const result = new ScanSettingsBuilder().withDependencyAnalysis(true).build();
      expect(result).to.deep.equal({ dependency_analysis: true });
    });

    it('should set dependency_analysis to false', () => {
      const result = new ScanSettingsBuilder().withDependencyAnalysis(false).build();
      expect(result).to.deep.equal({ dependency_analysis: false });
    });

    it('should not set when CLI value is undefined', () => {
      const result = new ScanSettingsBuilder().withDependencyAnalysis(undefined).build();
      expect(result).to.be.undefined;
    });

    it('should prefer settings file over CLI', () => {
      const settingsFile = { dependency_analysis: true };
      const result = new ScanSettingsBuilder(settingsFile).withDependencyAnalysis(false).build();
      expect(result).to.deep.equal({ dependency_analysis: true });
    });

    it('should parse string "true" to boolean true', () => {
      const result = new ScanSettingsBuilder().withDependencyAnalysis('true').build();
      expect(result).to.deep.equal({ dependency_analysis: true });
    });

    it('should parse string "false" to boolean false', () => {
      const result = new ScanSettingsBuilder().withDependencyAnalysis('false').build();
      expect(result).to.deep.equal({ dependency_analysis: false });
    });
  });

  describe('withSkipHeaders()', () => {
    it('should set skip_headers to true', () => {
      const result = new ScanSettingsBuilder().withSkipHeaders(true).build();
      expect(result).to.deep.equal({ skip_headers: true });
    });

    it('should set skip_headers to false', () => {
      const result = new ScanSettingsBuilder().withSkipHeaders(false).build();
      expect(result).to.deep.equal({ skip_headers: false });
    });

    it('should not set when CLI value is undefined', () => {
      const result = new ScanSettingsBuilder().withSkipHeaders(undefined).build();
      expect(result).to.be.undefined;
    });

    it('should prefer settings file over CLI', () => {
      const settingsFile = { skip_headers: true };
      const result = new ScanSettingsBuilder(settingsFile).withSkipHeaders(false).build();
      expect(result).to.deep.equal({ skip_headers: true });
    });

    it('should parse string "true" to boolean true', () => {
      const result = new ScanSettingsBuilder().withSkipHeaders('true').build();
      expect(result).to.deep.equal({ skip_headers: true });
    });

    it('should parse string "false" to boolean false', () => {
      const result = new ScanSettingsBuilder().withSkipHeaders('false').build();
      expect(result).to.deep.equal({ skip_headers: false });
    });
  });

  describe('withSkipHeadersLimit()', () => {
    it('should set skip_headers_limit from CLI value', () => {
      const result = new ScanSettingsBuilder().withSkipHeadersLimit(50).build();
      expect(result).to.deep.equal({ skip_headers_limit: 50 });
    });

    it('should set skip_headers_limit to 0 (no limit)', () => {
      const result = new ScanSettingsBuilder().withSkipHeadersLimit(0).build();
      expect(result).to.deep.equal({ skip_headers_limit: 0 });
    });

    it('should clamp negative values to 0', () => {
      const result = new ScanSettingsBuilder().withSkipHeadersLimit(-5).build();
      expect(result).to.deep.equal({ skip_headers_limit: 0 });
    });

    it('should not set when CLI value is undefined', () => {
      const result = new ScanSettingsBuilder().withSkipHeadersLimit(undefined).build();
      expect(result).to.be.undefined;
    });

    it('should prefer settings file over CLI', () => {
      const settingsFile = { skip_headers_limit: 30 };
      const result = new ScanSettingsBuilder(settingsFile).withSkipHeadersLimit(50).build();
      expect(result).to.deep.equal({ skip_headers_limit: 30 });
    });

    it('should parse string CLI values to number', () => {
      const result = new ScanSettingsBuilder().withSkipHeadersLimit('25').build();
      expect(result).to.deep.equal({ skip_headers_limit: 25 });
    });
  });

  describe('Chaining all methods', () => {
    it('should build complete settings from all CLI values', () => {
      const result = new ScanSettingsBuilder()
        .withMinSnippetHits(3)
        .withMinSnippetLines(5)
        .withRanking(true)
        .withRankingThreshold(7)
        .withHonourFileExist(true)
        .build();

      expect(result).to.deep.equal({
        min_snippet_hits: 3,
        min_snippet_lines: 5,
        ranking_enabled: true,
        ranking_threshold: 7,
        honour_file_exts: true,
      });
    });

    it('should merge settings file with CLI values correctly', () => {
      const settingsFile = {
        min_snippet_hits: 2,
        ranking_enabled: true,
      };
      const result = new ScanSettingsBuilder(settingsFile)
        .withMinSnippetHits(10)
        .withMinSnippetLines(8)
        .withRanking(false)
        .withRankingThreshold(5)
        .withHonourFileExist(true)
        .build();

      expect(result).to.deep.equal({
        min_snippet_hits: 2,        // from settings file (priority)
        min_snippet_lines: 8,       // from CLI (not in settings file)
        ranking_enabled: true,      // from settings file (priority)
        ranking_threshold: 5,       // from CLI (not in settings file)
        honour_file_exts: true,     // from CLI (not in settings file)
      });
    });

    it('should only include properties that were explicitly set', () => {
      const result = new ScanSettingsBuilder()
        .withMinSnippetHits(3)
        .withRanking(true)
        .build();

      expect(result).to.deep.equal({
        min_snippet_hits: 3,
        ranking_enabled: true,
      });
      expect(result).to.not.have.property('min_snippet_lines');
      expect(result).to.not.have.property('ranking_threshold');
      expect(result).to.not.have.property('honour_file_exts');
    });
  });
});