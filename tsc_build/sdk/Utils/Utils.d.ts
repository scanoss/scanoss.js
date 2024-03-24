/// <reference types="node" />
import * as Http from "http";
import * as Https from "https";
export declare class Utils {
    private static PAC_FindProxyForURL;
    static loadCaCertFromFile(file: string): void;
    static getPackageVersion(): string;
    static PACProxyResolver(pacURI: string, URL: string): Promise<string>;
    static PACProxyURLBuilder(proxyPAC: string): string;
    static testConnection(host: string, agent?: Http.Agent | Https.Agent): Promise<boolean>;
    static testProxyConnection(hostname: string, proxy: string): Promise<boolean>;
}
