// TODO: Rename to ScanossSettings
export interface Settings {
    bom?: Bom;
    settings?: SettingsConfig;
}

export interface SettingsConfig {
    file_snippet?: FileSnippetSettings;
}

export interface Proxy {
  host: string;
}

export interface HTTPConfig {
  base_uri?: string;
  ignore_cert_errors?: boolean;
}

export interface FileSnippetSettings {
    proxy?: Proxy;
    http_config?: HTTPConfig;
    min_snippet_hits?: number;
    min_snippet_lines?: number;
    ranking_enabled?: boolean;
    honour_file_exts?: boolean;
    ranking_threshold?: number;
    dependency_analysis?: boolean;
    // (Default: false) Skip license headers, comments, and imports at the beginning of files before snippet matching. Works together with skip_headers_limit.
    skip_headers?: boolean;
    // (Default:0) Maximum number of leading lines to strip when skip_headers is enabled. A value of 0 means no limit (strip all detected header lines).
    skip_headers_limit?: number;
}

export interface Bom {
    include: BomItem[];
    remove: BomItem[];
    replace: ReplaceBomItem[];
}

export interface BomItem {
    purl: string;
    path?: string;
}

export interface ReplaceBomItem extends BomItem {
    replace_with: string;
}

