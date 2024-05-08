#!/usr/bin/env node
import { Argument, Command, Option } from "commander";

import { Utils } from "../../sdk/Utils/Utils";
import { depHandler } from "../commands/dep";
import { scanHandler } from "../commands/scan";
import { wfpHandler } from "../commands/wfp";
import { cryptoHandler } from '../commands/crypto';

function CLIErrorHandler(e: Error) {
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
  scan.addOption(new Option("    --apiurl <apiurl>", "SCANOSS API URL (optional - default: https://api.osskb.org/scan/direct)"));
  scan.addOption(new Option("    --api2url <api2url>", "SCANOSS gRPC API 2.0 URL (optional - default: api.scanoss.com:443)"));
  scan.addOption(new Option("-k, --key <key>", "SCANOSS API Key token (optional - not required for default OSSKB URL)"));
  scan.addOption(new Option("    --ignore-cert-errors", "Ignore self signed certificate errors"));
  scan.addOption(new Option("    --ca-cert <cert>", "Specify a path for a cert used in SSL/TLS connection"));
  scan.addOption(new Option("    --proxy <proxy>", "Proxy URL to use for connections (optional). Can also use the environment variable \"HTTPS_PROXY=[ip]:[port]\" and \"grcp_proxy=[ip]:[port]\" for gRPC"));
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
  dependencies.addOption(new Option("-a, --grpc-host <host>", "SCANOSS GRPC HOST (optional - default: api.scanoss.com:443)"));

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


  const cryptography = new Command("crypto");
  cryptography.description("Scan local cryptography");
  cryptography.addArgument(new Argument("<source>"));

  // Options
  cryptography.addOption(new Option("-r, --rules <rules>", "Crypto rules"));
  cryptography.addOption(new Option("-o, --output <filename>", "Output result file name (optional - default stdout)"));
  cryptography.addOption(new Option("-T, --threads <threads>", "Number of threads to use while scanning (optional - default 5)"));

  cryptography.action((source, options) => {
    cryptoHandler(source, options).catch((e) => {
      CLIErrorHandler(e);
    });
  });

  const program = new Command();
  program.version(Utils.getPackageVersion());
  program.description("The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.");
  program.addCommand(scan);
  program.addCommand(dependencies);
  program.addCommand(fingerprint);
  program.addCommand(cryptography);

  await program.parseAsync(process.argv);



}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
