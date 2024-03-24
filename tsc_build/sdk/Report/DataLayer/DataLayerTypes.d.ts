/*************  Component interface definition  *************/
export interface ComponentDataLayer {
    key: string;
    purls: string[];
    name: string;
    vendor: string;
    url: string;
    health: Health;
    versions: Version[];
}
export interface Version {
    version: string;
    licenses: string[];
    copyrights: Copyright[];
    cryptography: Cryptography[];
    quality: Quality;
}
export interface Copyright {
    name: string;
    source: string;
}
export interface Cryptography {
    algorithm: string;
    strength: string;
}
export interface Quality {
    scoreAvg: number;
    count: number;
    sum: number;
}
export interface Health {
    creation_date: string;
    issues: number;
    last_push: string;
    last_update: string;
    watchers: number;
    country: string;
    stars: number;
    forks: number;
}
/*************  Component interface definition  *************/
/*************  Dependency interface definition  *************/
export interface DependencyDataLayer {
    file: string;
    dependencies: Dependency[];
}
export interface License {
    name: string;
    spdxid: string;
}
export interface Dependency {
    purl: string;
    component: string;
    version: string;
    licenses: License[];
}
/*************  Dependency interface definition  *************/
/*************  Vulnerability interface definition  *************/
export interface Vulnerability {
    id: string;
    cve: string;
    url: string;
    summary: string;
    severity: string;
    published: string;
    modified: string;
    source: string;
}
export interface VulnerabilityDataLayer {
    purl: string;
    vulnerability: Vulnerability[];
}
/*************  Vulnerability interface definition  *************/
/*************  License interface definition  *************/
export interface LicenseDataLayer {
    label: string;
    value: number;
    components: Array<LicenseComponent>;
}
export interface LicenseComponent {
    purl: string;
    name: string;
    versions: Array<string>;
    url: string;
    vendor: string;
}
/*************  License interface definition  *************/
/*************  License Obligation interface definition  *************/
export interface LicenseObligation {
    label: string;
    incompatibleWith: Array<string>;
    hasIncompatibles: Array<string>;
    copyleft: boolean;
}
/*************  License Obligation interface definition  *************/
export interface SummaryDataLayer {
    reportTitle: string;
    projectName: string;
    timestamp: Date;
    matchedFiles: number;
    noMatchFiles: number;
    totalFiles: number;
}
export interface IDataLayers {
    licenses: LicenseDataLayer[];
    licensesObligations: LicenseObligation[];
    component: ComponentDataLayer[];
    dependencies: DependencyDataLayer[];
    vulnerabilities: VulnerabilityDataLayer[];
    summary: SummaryDataLayer;
}
export interface DataProvider {
    getData(): Promise<IDataLayers>;
    getLayerName(): string;
}
