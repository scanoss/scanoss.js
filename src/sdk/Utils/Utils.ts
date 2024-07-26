import fs from 'fs';
import tls from 'tls';


export class Utils {
  private static PackageJSON: any = null;

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
}
