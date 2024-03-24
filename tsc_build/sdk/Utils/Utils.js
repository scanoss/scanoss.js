import getUri from "get-uri";
import ip from "ip";
import pac from "pac-resolver";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";
import { Logger, logger } from "../Logger";
import * as isInNet2 from "pac-resolver/dist/isInNet";
import fs from "fs";
import tls from "tls";
export class Utils {
    // This function takes inspiration from https://www.npmjs.com/package/syswide-cas
    // Copyright 2016 Capriza. Code released under the MIT license
    static loadCaCertFromFile(file) {
        const rootCAs = [];
        let content = fs.readFileSync(file, { encoding: "utf-8" }).trim();
        content = content.replace(/\r\n/g, "\n"); // Handles certificates that have been created in Windows
        const regex = /-----BEGIN CERTIFICATE-----\n[\s\S]+?\n-----END CERTIFICATE-----/g;
        const results = content.match(regex);
        if (!results)
            throw new Error("Could not parse certificate");
        results.forEach((match) => {
            const cert = match.trim();
            rootCAs.push(cert);
        });
        const origCreateSecureContext = tls.createSecureContext;
        tls.createSecureContext = function (options) {
            var c = origCreateSecureContext.apply(null, arguments);
            if (!options.ca && rootCAs.length > 0) {
                rootCAs.forEach(function (ca) {
                    // add to the created context our own root CAs
                    c.context.addCACert(ca);
                });
            }
            return c;
        };
    }
    static getPackageVersion() {
        return "v0.11.2";
    }
    static async PACProxyResolver(pacURI, URL) {
        const resolverStream = await getUri(pacURI);
        const chunks = [];
        for await (let chunk of resolverStream)
            chunks.push(chunk);
        const resolver = Buffer.concat(chunks);
        // See issue: https://github.com/TooTallNate/node-pac-resolver/issues/18
        const myIP = ip.address();
        logger.log(`[ SCANOSS_SDK.UTILS ]: Local IP address detected: ${myIP}`, Logger.Level.info);
        const pacOptions = {
            displayErrors: true,
            output: "async",
            sandbox: {
                isInNet: async (a, b, c) => {
                    return await isInNet2.default(a, b, c);
                },
                myIpAddress: () => {
                    return myIP;
                },
            },
        };
        this.PAC_FindProxyForURL = pac(resolver, pacOptions);
        return await this.PAC_FindProxyForURL(URL);
    }
    static PACProxyURLBuilder(proxyPAC) {
        let proxyURL = "";
        if (/(?:HTTPS|HTTP)/.test(proxyPAC)) {
            //The following line replaces the HTTPS/HTTP substring and appends
            //the protocol to the proxy address.
            proxyURL = proxyPAC.replace(/(HTTPS|HTTP)\s+/, (match, g1) => {
                return `${g1.toLowerCase()}://`;
            });
        }
        else if (/PROXY/i.test(proxyPAC)) {
            proxyURL = "http://" + proxyPAC.replace(/PROXY/, "").trim();
        }
        else if (/DIRECT/.test(proxyPAC)) {
            proxyURL = "";
        }
        return proxyURL;
    }
    static async testConnection(host, agent) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(host, {
                ...(agent && { agent }),
                // @ts-ignore
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok)
                throw new Error(response.status.toString());
            return true;
        }
        catch (e) {
            logger.log(`[ SCANOSS_SDK.UTILS ]: Failed to query ${host} ${e.name} | ${e.message}`, Logger.Level.info);
            return false;
        }
    }
    static async testProxyConnection(hostname, proxy) {
        let proxyAgent;
        if (/HTTPS/i.test(hostname))
            proxyAgent = new HttpsProxyAgent(proxy);
        else if (/HTTP/i.test(hostname))
            proxyAgent = new HttpProxyAgent(proxy);
        if (!proxyAgent)
            return false;
        return await this.testConnection(hostname, proxyAgent);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2RrL1V0aWxzL1V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFNBQVMsQ0FBQztBQUM3QixPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDcEIsT0FBTyxHQUE0QyxNQUFNLGNBQWMsQ0FBQztBQUN4RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sS0FBSyxNQUFNLFlBQVksQ0FBQztBQUcvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUMzQyxPQUFPLEtBQUssUUFBUSxNQUFNLDJCQUEyQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFFdEIsTUFBTSxPQUFPLEtBQUs7SUFJaEIsaUZBQWlGO0lBQ2pGLDhEQUE4RDtJQUN2RCxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBWTtRQUMzQyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFFbkIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsRSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyx5REFBeUQ7UUFDbkcsTUFBTSxLQUFLLEdBQUcsbUVBQW1FLENBQUM7UUFDbEYsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsT0FBTztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJB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