export interface LicensesList {
    name: string;
    spdxId: string;
    isSpdxApproved: boolean;
}

export interface DependenciesList {
    component: string;
    purl: string;
    version?: string;
    requirement?: string;
    scope?: string;
    licensesList: LicensesList[];
}

export interface FilesList {
    file: string;
    id: string;
    status: string;
    dependenciesList: DependenciesList[];
}

export interface IDependencyResponse {
    filesList: FilesList[];
    status?: string;
}
