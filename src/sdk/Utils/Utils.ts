import path from 'path';
import fs from 'fs';
import getUri from 'get-uri';
import pac, { FindProxyForURL } from 'pac-resolver';

export class Utils {
  private static PackageJSONPath: string = path.join(__dirname,"../../../../package.json");
  private static PackageJSON: any;
  private static PAC_FindProxyForURL: FindProxyForURL;



  public static getPackageVersion(): string {
    if (!this.PackageJSON) this.PackageJSON = JSON.parse(fs.readFileSync(this.PackageJSONPath, 'utf-8'));
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


}
