import fs from 'fs';


export class Utils {
  private static PackageJSON: any = null;

  // This function takes inspiration from https://www.npmjs.com/package/syswide-cas
  // Copyright 2016 Capriza. Code released under the MIT license
  public static readCaCertsFromFile(file: string): string[] {
    let content = fs.readFileSync(file, { encoding: "utf-8" }).trim();
    content = content.replace(/\r\n/g, "\n"); // Handles certificates that have been created in Windows
    const regex = /-----BEGIN CERTIFICATE-----\n[\s\S]+?\n-----END CERTIFICATE-----/g;
    const results = content.match(regex);
    if (!results) throw new Error("Could not parse certificate");
    return results.map(match => match.trim());
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
