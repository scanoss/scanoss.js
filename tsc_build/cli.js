#!/usr/bin/env node
import { Argument, Command, Option } from "commander";
import { Utils } from "./sdk/Utils/Utils";
import { depHandler } from "./cli/commands/dep";
import { scanHandler } from "./cli/commands/scan";
import { wfpHandler } from "./cli/commands/wfp";
function CLIErrorHandler(e) {
    console.error(" ");
    console.error(e);
    process.exit(1);
}
async function main() {
    const scan = new Command("scan");
    scan.addArgument(new Argument("<source>"));
    scan.description("Scan a folder/file");
    scan.addHelpText("after", "Example:\n$ scanoss-js scan -o scan-output.json <source-folder>");
    scan.addOption(new Option("-w, --wfp", "Scan a .wfp file instead of a folder"));
    scan.addOption(new Option("-H, --hpsm", "Scan using winnowing high precision matching"));
    scan.addOption(new Option("-x, --extract", "Extract compressed files before launch scan in folder <<zip_name>>-unzipped"));
    scan.addOption(new Option("   --extract-overwrite", "Overwrite folder when decompressing if exists"));
    scan.addOption(new Option("   --extract-deep <number>", "Sets uncompress recursion level"));
    scan.addOption(new Option("   --extract-suffix <suffix>", "Sets suffix for the folder name"));
    scan.addOption(new Option("-c, --concurrency <number>", "Number of concurrent connections to use while scanning (optional -default 10)"));
    scan.addOption(new Option("-n, --ignore <ignore>", "Ignore components specified in the SBOM file"));
    scan.addOption(new Option("-o, --output <filename>", "Output result file name (optional - default stdout)"));
    scan.addOption(new Option("-f, --format <format>", "Result output format").choices(["json", "html"]));
    scan.addOption(new Option("-F, --flags <flags>", "Scanning engine flags (1: disable snippet matching, 2 enable snippet ids, 4: disable dependencies, 8: disable licenses, 16: disable copyrights,32: disable vulnerabilities, 64: disable quality, 128: disable cryptography,256: disable best match, 512: Report identified files)"));
    scan.addOption(new Option("-P, --post-size postsize>", "Number of kilobytes to limit the post to while scanning (optional - default 32)"));
    scan.addOption(new Option("-R, --max-retry <retry>", "Max number of retries for each POST (optional -default 5)"));
    scan.addOption(new Option("-M, --timeout <timeout>", "Timeout (in seconds) for API communication (optional -default 120)"));
    scan.addOption(new Option("    --obfuscate", "Obfuscate fingerprints"));
    scan.addOption(new Option("-D, --dependencies", "Add dependency scanning"));
    scan.addOption(new Option("    --apiurl <apiurl>", "SCANOSS API URL (optional - default: https://osskb.org/api/scan/direct)"));
    scan.addOption(new Option("    --api2url <api2url>", "SCANOSS gRPC API 2.0 URL (optional - default: scanoss.com:443)"));
    scan.addOption(new Option("-k, --key <key>", "SCANOSS API Key token (optional - not required for default OSSKB URL)"));
    scan.addOption(new Option("    --ignore-cert-errors", "Ignore self signed certificate errors"));
    scan.addOption(new Option("    --ca-cert <cert>", "Specify a path for a cert used in SSL/TLS connection"));
    scan.addOption(new Option("    --proxy <proxy>", 'Proxy URL to use for connections (optional). Can also use the environment variable "HTTPS_PROXY=[ip]:[port]" and "grcp_proxy=[ip]:[port]" for gRPC'));
    scan.addOption(new Option("    --pac <pac>", "Proxy auto configuration (optional). Specify a file, http url or ftp url"));
    scan.addOption(new Option("-v, --verbose", "Makes scan operation verbose"));
    scan.action((source, options) => {
        scanHandler(source, options).catch((e) => {
            CLIErrorHandler(e);
        });
    });
    const dependencies = new Command("dep");
    dependencies.description("Scan for dependencies");
    dependencies.addArgument(new Argument("<source>"));
    dependencies.addOption(new Option("-o, --output <filename>", "Output result file name (optional - default stdout)"));
    dependencies.addOption(new Option("-a, --grpc-host <host>", "SCANOSS GRPC HOST (optional - default: scanoss.com:443)"));
    dependencies.action((source, options) => {
        depHandler(source, options).catch((e) => {
            CLIErrorHandler(e);
        });
    });
    const fingerprint = new Command("wfp");
    fingerprint.addArgument(new Argument("<source>"));
    fingerprint.description("Generates fingerprints for a folder/file");
    fingerprint.addOption(new Option("-H, --hpsm", "Scan using winnowing high precision matching"));
    fingerprint.addOption(new Option("--obfuscate", "Obfuscate fingerprints"));
    fingerprint.addOption(new Option("-o, --output <filename>", "Output result file name (optional - default stdout)"));
    fingerprint.addOption(new Option("-p, --block-size <size>", "Maximum size in Kb for each fingerprint block (optional - default 64Kb)"));
    fingerprint.action((source, options) => {
        wfpHandler(source, options).catch((e) => {
            CLIErrorHandler(e);
        });
    });
    const program = new Command();
    program.version(Utils.getPackageVersion());
    program.description("The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.");
    program.addCommand(scan);
    program.addCommand(dependencies);
    program.addCommand(fingerprint);
    await program.parseAsync(process.argv);
}
try {
    main();
}
catch (e) {
    console.error(e);
    process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXRELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVoRCxTQUFTLGVBQWUsQ0FBQyxDQUFDO0lBQ3hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUM7QUFFRCxLQUFLLFVBQVUsSUFBSTtJQUNqQixNQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGlFQUFpRSxDQUFDLENBQUM7SUFFN0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztJQUN6RixJQUFJLENBQUMsU0FBUyxDQUNaLElBQUksTUFBTSxD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