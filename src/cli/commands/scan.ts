import fs from "fs";
import { Scanner } from "../../sdk/scanner/Scanner";
import { SbomMode, ScannerEvents, ScannerInput, WinnowingMode } from "../../sdk/scanner/ScannerTypes";
import { ScannerCfg } from "../../sdk/scanner/ScannerCfg";
import { Tree } from "../../sdk/tree/Tree";
import cliProgress from "cli-progress";
import { DispatcherResponse } from "../../sdk/scanner/Dispatcher/DispatcherResponse";
import { getProjectNameFromPath, getSettingsFilePath, isFolder } from "./helpers";
import { DependencyScannerCfg } from "../../sdk/Dependencies/DependencyScannerCfg";
import { DependencyScanner } from "../../sdk/Dependencies/DependencyScanner";
import { ScanFilter } from "../../sdk/tree/Filters/ScanFilter";
import { DependencyFilter } from "../../sdk/tree/Filters/DependencyFilter";
import { Report } from "../../sdk/Report/Report";
import { DataProviderManager } from "../../sdk/Report/DataLayer/DataProviderManager";
import { ComponentDataProvider } from "../../sdk/Report/DataLayer/DataProviders/ComponentDataProvider";
import { DependencyDataProvider } from "../../sdk/Report/DataLayer/DataProviders/DependencyDataProvider";
import { LicenseDataProvider } from "../../sdk/Report/DataLayer/DataProviders/LicenseDataProvider";
import { SummaryDataProvider } from "../../sdk/Report/DataLayer/DataProviders/SummaryDataProvider";
import { DecompressionFilter } from "../../sdk/tree/Filters/DecompressionFilter";
import { DecompressionManager } from "../../sdk/Decompress/DecompressionManager";
import path from "path";
import { LicenseObligationDataProvider } from "../../sdk/Report/DataLayer/DataProviders/LicenseObligationDataProvider";
import { CryptographyDataProvider } from "../../sdk/Report/DataLayer/DataProviders/CryptographyDataProvider";
import { Settings } from "../../sdk/scanner/ScannnerResultPostProcessor/interfaces/types";
import { CryptoCfg } from "../../sdk/Cryptography/CryptoCfg";
import { CryptographyScanner } from "../../sdk/Cryptography/CryptographyScanner";
import { CryptographyResponse, LocalCryptography } from "../../sdk/Cryptography/CryptographyTypes";
import { DependencyResponse } from "../../sdk/Clients/Dependency/IDependencyClient";
import { parser } from "stream-json";
import { streamObject } from "stream-json/streamers/StreamObject";
import  { EOL } from 'os';
import { Logger, logger } from "../../sdk/Logger/Logger";

/**
 * Stream JSON scanner results and transform into new structure
 * @param resultPath Path to the scanner JSON results file
 * @param depResults Dependency results to include
 * @param cryptoFiles Cryptography files to include
 * @param cryptoComponents Cryptography components to include
 * @param outputPath Output file path (optional, writes to stdout if not provided)
 */
async function streamAndTransformResults(
  resultPath: string,
  depResults: DependencyResponse,
  cryptoFiles: Array<LocalCryptography>,
  cryptoComponents: Array<CryptographyResponse>,
  outputPath?: string
): Promise<void> {
  const pipeline = fs.createReadStream(resultPath)
    .pipe(parser())
    .pipe(streamObject());

  return new Promise((resolve, reject) => {
    // Create write stream or use stdout
    const writeStream = outputPath
      ? fs.createWriteStream(outputPath)
      : process.stdout;

    let firstScannerKey = true;

    // Helper to indent JSON output
    // Note: JSON.stringify always uses \n, so we split on \n but join with EOL for platform consistency
    const indentLines = (jsonStr: string, spaces: number): string => {
      const indent = ' '.repeat(spaces);
      return jsonStr.split('\n').map((line, idx) => idx === 0 ? line : indent + line).join(EOL);
    };

    // Start the result object
    writeStream.write(`{${EOL}`);
    writeStream.write(`  "scanner": {${EOL}`);

    pipeline.on('data', (data: { key: string; value: any }) => {
      // Stream each key-value pair from scanner results
      if (!firstScannerKey) {
        writeStream.write(`,${EOL}`);
      }
      const valueJson = JSON.stringify(data.value, null, 2);
      const indentedValue = indentLines(valueJson, 4);
      writeStream.write(`    ${JSON.stringify(data.key)}: ${indentedValue}`);
      firstScannerKey = false;
    });

    pipeline.on('end', () => {
      // Close scanner object and add other fields
      writeStream.write(`${EOL}  },${EOL}`);

      const depJson = JSON.stringify(depResults, null, 2);
      const indentedDep = indentLines(depJson, 2);
      writeStream.write(`  "dependencies": ${indentedDep},${EOL}`);

      writeStream.write(`  "cryptography": {${EOL}`);

      const filesJson = JSON.stringify(cryptoFiles, null, 2);
      const indentedFiles = indentLines(filesJson, 4);
      writeStream.write(`    "files": ${indentedFiles},${EOL}`);

      const componentsJson = JSON.stringify(cryptoComponents, null, 2);
      const indentedComponents = indentLines(componentsJson, 4);
      writeStream.write(`    "components": ${indentedComponents}${EOL}`);

      writeStream.write(`  }${EOL}`);
      writeStream.write('}');

      if (outputPath) {
        writeStream.end(() => resolve());
      } else {
        writeStream.write(EOL);
        resolve();
      }
    });

    pipeline.on('error', (error) => {
      if (outputPath && writeStream !== process.stdout) {
        (writeStream as fs.WriteStream).destroy();
      }
      reject(error);
    });

    if (outputPath) {
      writeStream.on('error', (error) => {
        pipeline.destroy();
        reject(error);
      });
    }
  });
}

export async function scanHandler(rootPath: string, options: any): Promise<void> {
  if(options.debug)
    logger.setLevel(Logger.Level.debug);
  rootPath = path.resolve(rootPath);
  const pathIsFolder = await isFolder(rootPath);
  const projectName = getProjectNameFromPath(rootPath);

  if (options.apiurl) {
    const url = new URL(options.apiurl);
    if (url.pathname) {
      logger.warn(`The entered URL "${options.apiurl}" contains a pathname "${url.pathname}", which is not supported. Setting URL to "${url.origin}".`)
    }
    options.apiurl = url.origin;
  }
  // Create dependency scanner and set parameters
  let dependencyInput: Array<string> = [];
  const dependencyScannerCfg = new DependencyScannerCfg();
  if (options.caCert) dependencyScannerCfg.CA_CERT = options.caCert;
  if (options.apiurl) dependencyScannerCfg.API_URL = options.apiurl;
  // TODO: Deprecated. Remove gRPC config on v1 version.
  if (options.api2url) dependencyScannerCfg.API_URL = options.api2url;
  if (options.proxy) {
    dependencyScannerCfg.HTTPS_PROXY = options.proxy;
    dependencyScannerCfg.HTTP_PROXY = options.proxy;
  }
  if (options.key) dependencyScannerCfg.API_KEY = options.key;
  if (options.ignoreCertErrors) dependencyScannerCfg.IGNORE_CERT_ERRORS = true;
  const dependencyScanner = new DependencyScanner(dependencyScannerCfg);

  // Create scanner and set connections parameters
  const scannerCfg = new ScannerCfg();
  if (options.concurrency) scannerCfg.CONCURRENCY_LIMIT = parseInt(options.concurrency);
  if (options.postSize) scannerCfg.WFP_FILE_MAX_SIZE = parseInt(options.postSize) * 1024;
  if (options.apiurl) scannerCfg.API_URL = options.apiurl;
  if (options.key) scannerCfg.API_KEY = options.key;
  if (options.timeout) scannerCfg.TIMEOUT = options.timeout * 1000;
  if (options.maxRetry) scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS = options.maxRetry;
  if (options.caCert) scannerCfg.CA_CERT = options.caCert;
  if (options.ignoreCertErrors) scannerCfg.IGNORE_CERT_ERRORS = true;

  if (options.proxy) {
    scannerCfg.HTTPS_PROXY = options.proxy;
    scannerCfg.HTTP_PROXY = options.proxy;
  }

  if (options.obfuscate) scannerCfg.WFP_OBFUSCATION = true;

  const scanner = new Scanner(scannerCfg);

  let scannerInput: ScannerInput = { fileList: [] };

  // SBOM Ingestion
  if (options.ignore) {
    scannerInput.sbom = fs.readFileSync(options.ignore, "utf-8");
    scannerInput.sbomMode = SbomMode.SBOM_IGNORE;
  }

  // Settings Ingestion
  if (!options.skipSettingsFile) {
    const settingsFilePath = await getSettingsFilePath(options.settings, rootPath);
    if (settingsFilePath) {
      try {
        const scanossSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf-8")) as unknown as Settings;
        scannerInput.settings = scanossSettings;
      } catch (e) {
        throw new Error(`SCANOSS Settings file cannot be found at: ${settingsFilePath}.`);
      }
    }
  }

  scannerInput.folderRoot = rootPath + path.sep; // This will remove the project root path from the results.
  if (options.flags) scannerInput.engineFlags = options.flags;
  if (options.wfp) scannerInput.wfpPath = rootPath;

  const wfpMode = options.hpsm ? WinnowingMode.FULL_WINNOWING_HPSM : WinnowingMode.FULL_WINNOWING;
  scannerInput.winnowing = { mode: wfpMode };

  if (!options.wfp) {
    if (pathIsFolder) {
      logger.debug(`Reading directory ${rootPath}...`);
      const tree = new Tree(rootPath);
      tree.build();

      if (options.extract) {
        const archives = tree.getFileList(new DecompressionFilter(""));
        console.error("Searching archives files...");
        if (archives.length) {
          console.error("Extracting archives...");
          const decompressionManager = new DecompressionManager(
            options.extractDeep,
            options.extractSuffix,
            options.extractOverwrite
          );
          const { failedFiles } = await decompressionManager.decompress(archives);
          if (failedFiles.length > 0) {
            console.error(`Warning: ${failedFiles.length} archive(s) failed to extract:`);
            for (const { path, error } of failedFiles) {
              console.error(`  - ${path}: ${error}`);
            }
          }
          console.error("Reindexing files...");
          tree.build();
        } else console.error("No archives found.");
      }
      scannerInput.fileList = tree.getFileList(new ScanFilter(""));
      dependencyInput = tree.getFileList(new DependencyFilter(""));
    } else {
      scannerInput.fileList = [rootPath];
      dependencyInput = [rootPath];
    }
  } else {
    const winnowing = fs.readFileSync(rootPath, { encoding: "utf-8" });
    scannerInput.fileList.length = [...winnowing.matchAll(/file=/g)].length;
  }

  if (!options.verbose) {
    const optBar1 = {
      format: "Scan Progress: [{bar}] {percentage}% | Scanned {value} files of {total}",
    };
    const bar1 = new cliProgress.SingleBar(optBar1, cliProgress.Presets.shades_classic);
    bar1.start(scannerInput.fileList.length, 0);

    scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, (dispResp: DispatcherResponse) => {
      bar1.increment(dispResp.getFilesScanned().length);
    });

    scanner.on(ScannerEvents.SCAN_DONE, async (resultPath) => {
      bar1.stop();
    });
  } else {
    scanner.on(ScannerEvents.SCANNER_LOG, (logText) => console.error(logText));
  }

  // Dependency scanner
  let pDependencyScanner = Promise.resolve(<DependencyResponse>{});
  if (options.dependencies) {
    pDependencyScanner = dependencyScanner.scan(dependencyInput);
  }

  const results = {
    scanner: {},
    dependencies: {} as unknown as DependencyResponse,
    cryptography: {
          files: [] as unknown as Array<LocalCryptography>,
          components: [] as unknown as Array<CryptographyResponse>,
    },
  }

  //Launch parallel scanners
  const pScanner = scanner.scan([scannerInput]);

  const [scannerResultPath, depResults] = await Promise.all([pScanner, pDependencyScanner]);
  results.dependencies = depResults;

  // Cryptography scanning
  if (options.cryptography) {
    const cfg = new CryptoCfg();
    if(options.algorithmRules) cfg.ALGORITHM_RULES_PATH = options.algorithmRules;
    if(options.libraryRules) cfg.LIBRARY_RULES_PATH = options.libraryRules;
    if(options.threads) cfg.THREADS = options.threads;
    if(options.key) cfg.API_KEY = options.key;
    if (options.caCert) cfg.CA_CERT = options.caCert;
    if (options.ignoreCertErrors) cfg.IGNORE_CERT_ERRORS = true;
    if (options.proxy) {
      cfg.HTTPS_PROXY = options.proxy;
      cfg.HTTP_PROXY = options.proxy;
    }
    if (options.apiurl) cfg.API_URL = options.apiurl;

    //TODO: Deprecated. Remove gRPC config on v1 version.
    if (options.api2url) cfg.API_URL = options.apiurl; //TODO: Deprecated. Remove on v1 version
    if(options.grpc_proxy) cfg.GRPC_PROXY = options.grpc_proxy; //TODO: Deprecated. Remove on v1 version

    const cryptoScanner = new CryptographyScanner(cfg);

    let localCrypto = await cryptoScanner.scanFiles(scannerInput.fileList);
    localCrypto.fileList = localCrypto.fileList.map((c) => {
      return { ...c, file: c.file.replace(rootPath, "") };
    });
    results.cryptography.files = localCrypto.fileList;

    // Component Cryptography - need to load scanner results first
    if (options.key) {
      // Stream load scanner results to get component list
      const scannerData = await new Promise<any>((resolve, reject) => {
        const pipeline = fs.createReadStream(scannerResultPath)
          .pipe(parser())
          .pipe(streamObject());

        const scannerResults: any = {};

        pipeline.on('data', (data: { key: string; value: any }) => {
          scannerResults[data.key] = data.value;
        });

        pipeline.on('end', () => resolve(scannerResults));
        pipeline.on('error', reject);
      });

      let componentList: any = Object.values(scannerData).flat();
      componentList = componentList.filter((component) => component.id !== "none");
      const cryptoRequest = componentList.map((c) => {
          return { purl: c.purl[0], requirement: c.version };
        });
      results.cryptography.components = await cryptoScanner.scanComponents(cryptoRequest);
    }
  }

  // Stream and transform results to avoid loading entire file in memory
  if (options.format && options.format.toLowerCase() === "html") {
    // Check file size before loading into memory for HTML format
    const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
    const fileStats = await fs.promises.stat(scannerResultPath);
    if (fileStats.size >= MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `Scanner result file is too large (${(fileStats.size / (1024 * 1024 * 1024)).toFixed(2)} GB) for HTML output. ` +
        `HTML format requires loading the entire file into memory, which is not supported for files >= 2GB. ` +
        `Please use JSON format instead.`
      );
    }

    // For HTML format, load scanner results into memory
    results.scanner = JSON.parse(await fs.promises.readFile(scannerResultPath, 'utf-8'));

    const dataProviderManager = new DataProviderManager();
    dataProviderManager.addDataProvider(
      new ComponentDataProvider(results.scanner, results.dependencies)
    );
    dataProviderManager.addDataProvider(new DependencyDataProvider(results.dependencies));
    dataProviderManager.addDataProvider(new LicenseDataProvider(results.scanner, results.dependencies));
    dataProviderManager.addDataProvider(new SummaryDataProvider(projectName, new Date(), results.scanner));

    dataProviderManager.addDataProvider(
      new LicenseObligationDataProvider(results.scanner, results.dependencies)
    );

    dataProviderManager.addDataProvider(
      new CryptographyDataProvider(results.cryptography.files, results.cryptography.components)
    );

    const report = new Report(dataProviderManager);
    const resultString = await report.getHTML();

    if (options.output) await fs.promises.writeFile(options.output, resultString);
    else console.log(resultString);
  } else {
    // For JSON format, stream the transformation
    await streamAndTransformResults(
      scannerResultPath,
      results.dependencies,
      results.cryptography.files,
      results.cryptography.components,
      options.output
    );
  }
}
