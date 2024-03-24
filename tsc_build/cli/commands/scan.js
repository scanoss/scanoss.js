import fs from 'fs';
import { Scanner } from '../../sdk/scanner/Scanner';
import { SbomMode, ScannerEvents, WinnowingMode, } from '../../sdk/scanner/ScannerTypes';
import { ScannerCfg } from '../../sdk/scanner/ScannerCfg';
import { Tree } from '../../sdk/tree/Tree';
import cliProgress from 'cli-progress';
import { getProjectNameFromPath, isFolder } from './helpers';
import { DependencyScannerCfg } from '../../sdk/Dependencies/DependencyScannerCfg';
import { DependencyScanner } from '../../sdk/Dependencies/DependencyScanner';
import { ScanFilter } from '../../sdk/tree/Filters/ScanFilter';
import { DependencyFilter } from '../../sdk/tree/Filters/DependencyFilter';
import { Report } from '../../sdk/Report/Report';
import { DataProviderManager } from '../../sdk/Report/DataLayer/DataProviderManager';
import { ComponentDataProvider } from '../../sdk/Report/DataLayer/DataProviders/ComponentDataProvider';
import { DependencyDataProvider } from '../../sdk/Report/DataLayer/DataProviders/DependencyDataProvider';
import { LicenseDataProvider } from '../../sdk/Report/DataLayer/DataProviders/LicenseDataProvider';
import { SummaryDataProvider } from '../../sdk/Report/DataLayer/DataProviders/SummaryDataProvider';
import { DecompressionFilter } from '../../sdk/tree/Filters/DecompressionFilter';
import { DecompressionManager } from '../../sdk/Decompress/DecompressionManager';
import path from 'path';
import { LicenseObligationDataProvider } from '../../sdk/Report/DataLayer/DataProviders/LicenseObligationDataProvider';
export async function scanHandler(rootPath, options) {
    rootPath = path.resolve(rootPath);
    const pathIsFolder = await isFolder(rootPath);
    const projectName = getProjectNameFromPath(rootPath);
    // Create dependency scanner and set parameters
    let dependencyInput = [];
    const dependencyScannerCfg = new DependencyScannerCfg();
    if (options.api2url)
        dependencyScannerCfg.API_URL = options.api2url;
    if (options.proxy)
        dependencyScannerCfg.PROXY = options.proxy;
    if (options.pac)
        dependencyScannerCfg.PAC = options.pac;
    await dependencyScannerCfg.validate();
    const dependencyScanner = new DependencyScanner(dependencyScannerCfg);
    // Create scanner and set connections parameters
    const scannerCfg = new ScannerCfg();
    if (options.concurrency)
        scannerCfg.CONCURRENCY_LIMIT = parseInt(options.concurrency);
    if (options.postSize)
        scannerCfg.WFP_FILE_MAX_SIZE = parseInt(options.postSize) * 1024;
    if (options.apiurl)
        scannerCfg.API_URL = options.apiurl;
    if (options.key)
        scannerCfg.API_KEY = options.key;
    if (options.timeout)
        scannerCfg.TIMEOUT = options.timeout * 1000;
    if (options.maxRetry)
        scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS = options.maxRetry;
    if (options.caCert)
        scannerCfg.CA_CERT = options.caCert;
    if (options.ignoreCertErrors)
        scannerCfg.IGNORE_CERT_ERRORS = true;
    if (options.pac)
        scannerCfg.PAC = options.pac;
    if (options.proxy)
        scannerCfg.PROXY = options.proxy;
    if (options.obfuscate)
        scannerCfg.WFP_OBFUSCATION = true;
    await scannerCfg.validate();
    const scanner = new Scanner(scannerCfg);
    let scannerInput = { fileList: [] };
    scannerInput.folderRoot = rootPath + path.sep; // This will remove the project root path from the results.
    if (options.flags)
        scannerInput.engineFlags = options.flags;
    if (options.wfp)
        scannerInput.wfpPath = rootPath;
    const wfpMode = options.hpsm
        ? WinnowingMode.FULL_WINNOWING_HPSM
        : WinnowingMode.FULL_WINNOWING;
    scannerInput.winnowing = { mode: wfpMode };
    if (!options.wfp) {
        if (pathIsFolder) {
            console.error('\nReading directory...  ');
            const tree = new Tree(rootPath);
            tree.build();
            if (options.extract) {
                const archives = tree.getFileList(new DecompressionFilter(''));
                console.error('Searching archives files...');
                if (archives.length) {
                    console.error('Extracting archives...');
                    const decompressionManager = new DecompressionManager(options.extractDeep, options.extractSuffix, options.extractOverwrite);
                    await decompressionManager.decompress(archives);
                    console.error('Reindexing files...');
                    tree.build();
                }
                else
                    console.error('No archives found.');
            }
            scannerInput.fileList = tree.getFileList(new ScanFilter(''));
            dependencyInput = tree.getFileList(new DependencyFilter(''));
        }
        else {
            scannerInput.fileList = [rootPath];
            dependencyInput = [rootPath];
        }
    }
    else {
        const winnowing = fs.readFileSync(rootPath, { encoding: 'utf-8' });
        scannerInput.fileList.length = [...winnowing.matchAll(/file=/g)].length;
    }
    if (!options.verbose) {
        const optBar1 = {
            format: 'Scan Progress: [{bar}] {percentage}% | Scanned {value} files of {total}',
        };
        const bar1 = new cliProgress.SingleBar(optBar1, cliProgress.Presets.shades_classic);
        bar1.start(scannerInput.fileList.length, 0);
        scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, (dispResp) => {
            bar1.increment(dispResp.getFilesScanned().length);
        });
        scanner.on(ScannerEvents.SCAN_DONE, async (resultPath) => {
            bar1.stop();
        });
    }
    else {
        scanner.on(ScannerEvents.SCANNER_LOG, (logText) => console.error(logText));
    }
    if (options.ignore) {
        scannerInput.sbom = fs.readFileSync(options.ignore, 'utf-8');
        scannerInput.sbomMode = SbomMode.SBOM_IGNORE;
    }
    // Dependency scanner
    let pDependencyScanner = Promise.resolve({});
    if (options.dependencies) {
        pDependencyScanner = dependencyScanner.scan(dependencyInput);
    }
    //Launch parallel scanners
    const pScanner = scanner.scan([scannerInput]);
    const [scannerResultPath, depResults] = await Promise.all([
        pScanner,
        pDependencyScanner,
    ]);
    const scannerResults = JSON.parse(await fs.promises.readFile(scannerResultPath, 'utf-8'));
    //TODO Unify results.json and dependency.json. What happens with result.json that includes dependencies?
    const scannersResults = {
        scanner: scannerResults,
        ...(options.dependencies && { dependencies: depResults }),
    };
    let scannerResultsString = JSON.stringify(scannersResults, null, 2);
    if (options.format && options.format.toLowerCase() === 'html') {
        const dataProviderManager = new DataProviderManager();
        dataProviderManager.addDataProvider(new ComponentDataProvider(scannersResults.scanner, scannersResults.dependencies));
        dataProviderManager.addDataProvider(new DependencyDataProvider(scannersResults.dependencies));
        dataProviderManager.addDataProvider(new LicenseDataProvider(scannersResults.scanner, scannersResults.dependencies));
        dataProviderManager.addDataProvider(new SummaryDataProvider(projectName, new Date(), scannersResults.scanner));
        dataProviderManager.addDataProvider(new LicenseObligationDataProvider(scannersResults.scanner, scannersResults.dependencies));
        const report = new Report(dataProviderManager);
        scannerResultsString = await report.getHTML();
    }
    if (options.output)
        await fs.promises.writeFile(options.output, scannerResultsString);
    else
        console.log(scannerResultsString);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tbWFuZHMvc2Nhbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFFcEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3BELE9BQU8sRUFDTCxRQUFRLEVBQ1IsYUFBYSxFQUdiLGFBQWEsR0FDZCxNQUFNLGdDQUFnQyxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxXQUFXLE1BQU0sY0FBYyxDQUFDO0FBRXZDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxRQUFRLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFN0QsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDbkYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFFN0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUNyRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxnRUFBZ0UsQ0FBQztBQUN2RyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxpRUFBaUUsQ0FBQztBQUN6RyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw4REFBOEQsQ0FBQztBQUNuRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw4REFBOEQsQ0FBQztBQUNuRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFB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