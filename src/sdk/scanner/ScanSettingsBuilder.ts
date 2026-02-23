import { FileSnippetSettings } from "./ScannnerResultPostProcessor/interfaces/types";

function toBoolean(value: boolean | string): boolean {
  if (typeof value === 'string') return value === 'true';
  return value;
}

export class ScanSettingsBuilder {
  private readonly settingsFileSnippet: FileSnippetSettings | undefined;
  private readonly fileSnippetSettings: FileSnippetSettings = {};

  constructor(settingsFileSnippet?: FileSnippetSettings) {
    this.settingsFileSnippet = settingsFileSnippet;
  }

  // Priority: scanoss.json file_snippet settings > CLI arguments
  // 0 means defer to server config
  withMinSnippetHits(cliValue?: number | string): this {
    const cliMinSnippetHits = cliValue != null ? Number(cliValue) : undefined;
    const merged = this.settingsFileSnippet?.min_snippet_hits ?? cliMinSnippetHits;
    if (merged != null && merged !== 0) {
      this.fileSnippetSettings.min_snippet_hits = Math.max(0, merged);
    }
    return this;
  }

  // 0 means defer to server config
  withMinSnippetLines(cliValue?: number | string): this {
    const cliMinSnippetLines = cliValue != null ? Number(cliValue) : undefined;
    const merged = this.settingsFileSnippet?.min_snippet_lines ?? cliMinSnippetLines;
    if (merged != null && merged !== 0) {
      this.fileSnippetSettings.min_snippet_lines = Math.max(0, merged);
    }
    return this;
  }

  // Only send if explicitly set
  withRanking(cliValue?: boolean | string): this {
    const cliRanking = cliValue != null ? toBoolean(cliValue) : undefined;
    const merged = this.settingsFileSnippet?.ranking_enabled ?? cliRanking;
    if (merged != null) {
      this.fileSnippetSettings.ranking_enabled = merged;
    }
    return this;
  }

  // -1 means defer to server config, valid range -1 to 10
  withRankingThreshold(cliValue?: number | string): this {
    const MAX_RANKING_THRESHOLD = 10;
    const cliRankingThreshold = cliValue != null ? Number(cliValue) : undefined;
    const merged = this.settingsFileSnippet?.ranking_threshold ?? cliRankingThreshold;
    if (merged != null && merged !== -1) {
      let clamped = merged;
      if (clamped > MAX_RANKING_THRESHOLD) {
        console.error(`WARNING: ranking-threshold value ${clamped} exceeds maximum allowed (${MAX_RANKING_THRESHOLD}). Setting to ${MAX_RANKING_THRESHOLD}.`);
        clamped = MAX_RANKING_THRESHOLD;
      } else if (clamped < -1) {
        console.error(`WARNING: ranking-threshold value ${clamped} is below minimum allowed (-1). Setting to -1.`);
        clamped = -1;
      }
      if (clamped !== -1) {
        this.fileSnippetSettings.ranking_threshold = clamped;
      }
    }
    return this;
  }

  // Only send if explicitly set
  withHonourFileExist(cliValue?: boolean | string): this {
    const cliHonourFileExts = cliValue != null ? toBoolean(cliValue) : undefined;
    const merged = this.settingsFileSnippet?.honour_file_exts ?? cliHonourFileExts;
    if (merged != null) {
      this.fileSnippetSettings.honour_file_exts = merged;
    }
    return this;
  }

  // Only send if explicitly set
  withDependencyAnalysis(cliValue?: boolean | string): this {
    const cliDependencyAnalysis = cliValue != null ? toBoolean(cliValue) : undefined;
    const merged = this.settingsFileSnippet?.dependency_analysis ?? cliDependencyAnalysis;
    if (merged != null) {
      this.fileSnippetSettings.dependency_analysis = merged;
    }
    return this;
  }

  build(): FileSnippetSettings | undefined {
    if (Object.keys(this.fileSnippetSettings).length > 0) {
      return this.fileSnippetSettings;
    }
    return undefined;
  }
}
