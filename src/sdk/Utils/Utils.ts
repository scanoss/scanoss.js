import path from 'path';
import fs from 'fs';
import getUri from 'get-uri';
import pac, { FindProxyForURL } from 'pac-resolver';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import * as Http from 'http';
import * as Https from 'https';
import { Logger, logger } from '../Logger';

const pjson = require('../../../../package.json')
export class Utils {
  private static PackageJSON: any;
  private static PAC_FindProxyForURL: FindProxyForURL;



  public static getPackageVersion(): string {
    if (!this.PackageJSON) this.PackageJSON = pjson;
    return this.PackageJSON.version
  }


  public static async PACProxyResolver(pacURI: string, URL: string) {
    const resolverStream = await getUri(pacURI);

    const chunks = []
    for await (let chunk of resolverStream) chunks.push(chunk)
    const resolver = Buffer.concat(chunks);

    this.PAC_FindProxyForURL = pac(resolver);
    return this.PAC_FindProxyForURL(URL)
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
