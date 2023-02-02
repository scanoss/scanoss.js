import path from 'path';
import fs from 'fs';

export class Utils {
  private static PackageJSONPath: string = path.join(__dirname,"../../../../package.json");
  private static PackageJSON: any;

  public static getPackageVersion(): string {
    if (!this.PackageJSON) this.PackageJSON = JSON.parse(fs.readFileSync(this.PackageJSONPath, 'utf-8'));
    return this.PackageJSON.version
  }




}
