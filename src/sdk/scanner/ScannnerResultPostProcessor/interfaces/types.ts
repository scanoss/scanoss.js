// TODO: Rename to ScanossSettings
export interface Settings {
    bom?: Bom;
    settings?: SettingsConfig;
}

export interface SettingsConfig {
    file_snippet?: FileSnippetSettings;
}

export interface FileSnippetSettings {
    min_snippet_hits?: number;
    min_snippet_lines?: number;
    ranking_enabled?: boolean;
    honour_file_exts?: boolean;
    ranking_threshold?: number;
    dependency_analysis?: boolean;
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

