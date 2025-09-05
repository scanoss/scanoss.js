import fs from "fs";
import { ComponentsScanner } from "../../sdk/Components/ComponentsScanner";
import { ComponentsScannerCfg } from "../../sdk/Components/ComponentsScannerCfg";
import { Logger, logger } from "../../sdk/Logger";

export async function componentsHandler(action: string, options: any): Promise<void> {
  logger.setLevel(Logger.Level.info);
  if (options.debug) {
    logger.setLevel(Logger.Level.debug);
  }

  const componentsScannerCfg = new ComponentsScannerCfg();
  if (options.caCert) componentsScannerCfg.CA_CERT = options.caCert;
  if (options.apiurl) componentsScannerCfg.API_URL = options.apiurl;
  if (options.proxy) {
    componentsScannerCfg.HTTPS_PROXY = options.proxy;
    componentsScannerCfg.HTTP_PROXY = options.proxy;
  }
  if (options.key) componentsScannerCfg.API_KEY = options.key;
  if (options.ignoreCertErrors) componentsScannerCfg.IGNORE_CERT_ERRORS = true;
  if (options.grpc) componentsScannerCfg.USE_GRPC = true;

  const componentsScanner = new ComponentsScanner(componentsScannerCfg);

  try {
    let results: any;

    switch (action) {
      case 'search':
        if (!options.query && !options.vendor && !options.component) {
          throw new Error('Search requires at least one of: --query, --vendor, or --component');
        }

        results = await componentsScanner.searchComponents({
          search: options.query,
          vendor: options.vendor,
          component: options.component,
          package: options.package,
          limit: options.limit ? parseInt(options.limit) : undefined,
          offset: options.offset ? parseInt(options.offset) : undefined
        });
        break;

      case 'versions':
        if (!options.purl) {
          throw new Error('Versions command requires --purl parameter');
        }

        results = await componentsScanner.getComponentVersions({
          purl: options.purl,
          limit: options.limit ? parseInt(options.limit) : undefined
        });
        break;

      case 'stats':
        if (!options.purls && !options.purlsFile) {
          throw new Error('Stats command requires either --purls or --purls-file parameter');
        }

        let components = [];
        if (options.purls) {
          // Parse comma-separated PURLs
          const purlList = options.purls.split(',').map(purl => purl.trim());
          components = purlList.map(purl => ({ purl }));
        } else if (options.purlsFile) {
          // Read PURLs from file
          const fileContent = await fs.promises.readFile(options.purlsFile, 'utf-8');
          const purlList = fileContent.split('\n').map(line => line.trim()).filter(line => line);
          components = purlList.map(purl => ({ purl }));
        }

        results = await componentsScanner.getComponentStatistics(components);
        break;

      case 'info':
        if (!options.name) {
          throw new Error('Info command requires --name parameter');
        }

        results = await componentsScanner.getComponentInfo(
          options.name,
          options.includeVersions || false,
          options.includeStats || false
        );
        break;

      default:
        throw new Error(`Unknown action: ${action}. Supported actions: search, versions, stats, info`);
    }

    if (options.output) {
      await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
      console.log(`Results saved to ${options.output}`);
    } else {
      console.log(JSON.stringify(results, null, 2));
    }

  } catch (error) {
    logger.log('Error in components command:', error);
    console.error('Error:', error.message);
    process.exit(1);
  }
}