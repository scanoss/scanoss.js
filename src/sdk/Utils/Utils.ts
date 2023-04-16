import getUri from 'get-uri';
import ip from 'ip';
import pac, { FindProxyForURL, PacResolverOptions } from 'pac-resolver';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import * as Http from 'http';
import * as Https from 'https';
import { Logger, logger } from '../Logger';
import * as isInNet2 from 'pac-resolver/dist/isInNet';
import fs from 'fs';
import tls from 'tls';


export class Utils {
  private static PackageJSON: any = null;
  private static PAC_FindProxyForURL: FindProxyForURL;

  // This function takes inspiration from https://www.npmjs.com/package/syswide-cas
  // Copyright 2016 Capriza. Code released under the MIT license
  public static loadCaCertFromFile(file: string) {
    const rootCAs = [];

    let content = fs.readFileSync(file, { encoding: "utf-8" }).trim();
    content = content.replace(/\r\n/g, "\n"); // Handles certificates that have been created in Windows
    const regex = /-----BEGIN CERTIFICATE-----\n[\s\S]+?\n-----END CERTIFICATE-----/g;
    const results = content.match(regex);
    if (!results) throw new Error("Could not parse certificate");

    results.forEach((match)=> {
      const cert = match.trim();
      rootCAs.push(cert);
    });

    const origCreateSecureContext = tls.createSecureContext;
    tls.createSecureContext = function(options) {
      var c = origCreateSecureContext.apply(null, arguments);
      if (!options.ca && rootCAs.length > 0) {
        rootCAs.forEach(function(ca) {
          // add to the created context our own root CAs
          c.context.addCACert(ca);
        });
      }
      return c;
    };
  }

  public static getPackageVersion(): string {
    if (!this.PackageJSON) {
      const path = require('path');
      const possiblePackageJsonPaths = [
        path.join(__dirname, '../../../../package.json'),
        path.join(__dirname, '../../../package.json')
      ];
      for (const packageJsonPath of possiblePackageJsonPaths) {
        try {
          this.PackageJSON = require(packageJsonPath);
        } catch (e) {}
        if (this.PackageJSON) break;
      }
    }
    return this.PackageJSON?.version ? this.PackageJSON.version : ''
  }


  public static async PACProxyResolver(pacURI: string, URL: string) {
    const resolverStream = await getUri(pacURI);

    const chunks = []
    for await (let chunk of resolverStream) chunks.push(chunk)
    const resolver = Buffer.concat(chunks);

    // See issue: https://github.com/TooTallNate/node-pac-resolver/issues/18
    const myIP = ip.address();

    logger.log(`[ SCANOSS_SDK.UTILS ]: Local IP address detected: ${myIP}`, Logger.Level.info)

    const pacOptions: PacResolverOptions = {
      displayErrors: true,
      output: 'async',
      sandbox: {
        isInNet: async (a,b,c) => {
          return await isInNet2.default(a,b,c)
        },
        myIpAddress: (): string => {
          return myIP;
        },
      },
    };

    this.PAC_FindProxyForURL = pac(resolver, pacOptions);
    return await this.PAC_FindProxyForURL(URL)
  }

  public static PACProxyURLBuilder(proxyPAC: string): string {
    let proxyURL: string = '';
    if(/(?:HTTPS|HTTP)/.test(proxyPAC)) {
      //The following line replaces the HTTPS/HTTP substring and appends
      //the protocol to the proxy address.
      proxyURL = proxyPAC.replace(/(HTTPS|HTTP)\s+/,
        (match, g1) => {return `${g1.toLowerCase()}://`});
    } else if (/PROXY/i.test(proxyPAC)) {
      proxyURL = "http://" + proxyPAC.replace(/PROXY/, '').trim();
    } else if (/DIRECT/.test(proxyPAC)) {
      proxyURL = '';
    }
    return proxyURL;
  }
  public static async testConnection(host:string, agent?: Http.Agent | Https.Agent): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(host, {
        ...(agent && {agent}),
        // @ts-ignore
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(response.status.toString());
      return true;
    } catch (e: any) {
      logger.log(`[ SCANOSS_SDK.UTILS ]: Failed to query ${host} ${e.name} | ${e.message}`, Logger.Level.info)
      return false;
    }
  }

  public static async testProxyConnection(hostname:string, proxy: string ): Promise<boolean> {
    let proxyAgent: HttpsProxyAgent | HttpProxyAgent;
    if (/HTTPS/i.test(hostname)) proxyAgent = new HttpsProxyAgent(proxy);
    else if (/HTTP/i.test(hostname)) proxyAgent = new HttpProxyAgent(proxy);
    if (!proxyAgent) return false;
    return await this.testConnection(hostname, proxyAgent);
  }

}
