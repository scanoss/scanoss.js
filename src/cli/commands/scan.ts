import fs from "fs";
import { Scanner } from "../../sdk/scanner/Scanner";
import { SbomMode, ScannerEvents, ScannerInput, ScannerResults, WinnowingMode } from "../../sdk/scanner/ScannerTypes";
import { ScannerCfg } from "../../sdk/scanner/ScannerCfg";
import { Tree } from "../../sdk/tree/Tree";
import cliProgress from "cli-progress";
import { DispatcherResponse } from "../../sdk/scanner/Dispatcher/DispatcherResponse";
import { getProjectNameFromPath, getSettingsFilePath, isFolder } from "./helpers";

import { DependencyScannerCfg } from "../../sdk/Dependencies/DependencyScannerCfg";
import { DependencyScanner } from "../../sdk/Dependencies/DependencyScanner";
import { IDependencyResponse } from "../../sdk/Dependencies/DependencyTypes";
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

export async function scanHandler(rootPath: string, options: any): Promise<void> {
  // TODO: Add flag to enable debug. False by default.  logger.enableDebug(options.debug);
  rootPath = path.resolve(rootPath);
  const pathIsFolder = await isFolder(rootPath);
  const projectName = getProjectNameFromPath(rootPath);

  // Create dependency scanner and set parameters
  let dependencyInput: Array<string> = [];
  const dependencyScannerCfg = new DependencyScannerCfg();
  if (options.caCert) dependencyScannerCfg.CA_CERT = options.caCert;
  if (options.api2url) dependencyScannerCfg.API_URL = options.api2url;
  if (options.grpc_proxy) dependencyScannerCfg.GRPC_PROXY = options.grpc_proxy;
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
      console.error("\nReading directory...  ");
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
          await decompressionManager.decompress(archives);
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
  let pDependencyScanner = Promise.resolve(<IDependencyResponse>{});
  if (options.dependencies) {
    pDependencyScanner = dependencyScanner.scan(dependencyInput);
  }

  const results = {
    scanner: {},
    dependencies: {} as unknown as IDependencyResponse,
    cryptography: {
          files: [] as unknown as Array<LocalCryptography>,
          components: [] as unknown as Array<CryptographyResponse>,
    },
  }

  //Launch parallel scanners
  const pScanner = scanner.scan([scannerInput]);

  const [scannerResultPath, depResults] = await Promise.all([pScanner, pDependencyScanner]);
  results.scanner = JSON.parse(await fs.promises.readFile(scannerResultPath, "utf-8"));
  results.dependencies = depResults;

  if (options.cryptography) {

    // Load rules
    let algorithmRules = null;
    let libraryRules = null;
    if(options.algorithmRules) algorithmRules = options.algorithmRules;
    if(options.libraryRules) libraryRules = options.libraryRules;

    // Local Cryptography
    const cryptoCfg = new CryptoCfg({
      threads: 5,
      libraryRulesPath: libraryRules,
      algorithmRulesPath: algorithmRules,
      apiKey: options.key,
    });

    // Proxy setup
    if (options.caCert) cryptoCfg.CA_CERT = options.caCert; // Path to Certs
    if (options.api2url) cryptoCfg.API_URL = options.api2url; // Destination Host
    if (options.grpc_proxy) cryptoCfg.GRPC_PROXY = options.grpc_proxy; // Proxy Host

    const cryptoScanner = new CryptographyScanner(cryptoCfg);
    let localCrypto = await cryptoScanner.scanFiles(scannerInput.fileList);
    localCrypto.fileList = localCrypto.fileList.map((c) => {
      return { ...c, file: c.file.replace(rootPath, "") };
    });
    results.cryptography.files = localCrypto.fileList;

    // Component Cryptography
    if (options.key) {
      let componentList: any = Object.values(results.scanner).flat();
      componentList = componentList.filter((component) => component.id !== "none");
      const cryptoRequest = {
        purlsList: componentList.map((c) => {
          return { purl: c.purl[0], requirement: c.version };
        }),
      };
      results.cryptography.components = await cryptoScanner.scanComponents(cryptoRequest);
    }
  }

  let resultString = JSON.stringify(results, null, 2);

  if (options.format && options.format.toLowerCase() === "html") {
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
    resultString = await report.getHTML();
  }

  if (options.output) await fs.promises.writeFile(options.output, resultString);
  else console.log(resultString);
}
