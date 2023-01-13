#!/usr/bin/env node

import { program } from 'commander';
import { depHandler } from '../commands/dep';
import { wfpHandler } from '../commands/wfp';
import { scanHandler } from '../commands/scan';

function CLIErrorHandler(e: Error) {
  console.error(' ');
  console.error(e);
  process.exit(1);
}




async function main() {
  program
    .version("0.6.2")
    .description('The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.')

  program
    .command('scan <source>')
    .description('Scan a folder/file')
    .option('-w, --wfp', 'Scan a .wfp file instead of a folder')
    .option('-H, --hpsm', 'Scan using winnowing high precision matching')
    .option('-x, --extract', 'Extract compressed files before launch scan in folder <<zip_name>>-unzipped')
    .option('   --extract-overwrite', 'Overwrite folder when decompressing if exists')
    .option('   --extract-deep <number>', 'Sets uncompress recursion level')
    .option('   --extract-suffix <suffix>', 'Sets suffix for the folder name')
    .option('-c, --concurrency <number>', 'Number of concurrent connections to use while scanning (optional -default 10)')
    .option('-n, --ignore <ignore>',  'Ignore components specified in the SBOM file')
    .option('-o, --output <filename>', 'Output result file name (optional - default stdout)')
    .option('-f, --format <format>', 'Result output format. {JSON, HTML} Default: JSON')
    .option('-F, --flags <flags>', 'Scanning engine flags (1: disable snippet matching, 2 enable snippet ids, 4: disable dependencies, 8: disable licenses, 16: disable copyrights,32: disable vulnerabilities, 64: disable quality, 128: disable cryptography,256: disable best match, 512: Report identified files)')
    .option('-P, --post-size <postsize>', 'Number of kilobytes to limit the post to while scanning (optional - default 64)')
    .option('-R, --max-retry <retry>', 'Max number of retries for each POST (optional -default 5)')
    .option('-M, --timeout <timeout>', 'Timeout (in seconds) for API communication (optional -default 120)')
    .option('-D, --dependencies', 'Add dependency scanning')
    .option('-a, --apiurl <apiurl>', 'SCANOSS API URL (optional - default: https://osskb.org/api/scan/direct)')
    .option('-a, --api2url <api2url>', 'SCANOSS gRPC API 2.0 URL (optional - default: scanoss.com)')
    .option('-k, --key <key>', 'SCANOSS API Key token (optional - not required for default OSSKB URL)')
    .option('--ignore-cert-errors', 'Ignore self signed certificate errors')
    .option('--ca-cert <cert>', 'Specify a path for a cert used in SSL/TLS connection')
    .option('--proxy <proxy>', 'Use proxy')
    .option('-v, --verbose', 'Makes scan operation verbose')
    .action((source, options) => {scanHandler(source, options).catch((e) => {CLIErrorHandler(e)})})
    .addHelpText('after', `
  Examples:
    $ scanoss-js scan -o scan-output.json <source-folder>`
    );

    program
    .command('dep <source>')
    .description('Scan for dependencies')
    .option('-o, --output <filename>', 'Output result file name (optional - default stdout)')
    .option('-a, --grpc-host <host>', 'SCANOSS GRPC HOST (optional - default: scanoss.com)')
    .option('-p, --grpc-port <port>', 'SCANOSS GRPC PORT  (optional - default: 443)')
    .action((source, options) => {depHandler(source, options).catch((e) => {CLIErrorHandler(e)})})

    program
    .command('wfp <source>')
    .description('Generates fingerprints for a folder/file')
    .option('-H, --hpsm', 'Scan using winnowing high precision matching')
    .option('-o, --output <filename>', 'Output result file name (optional - default stdout)')
    .option('-p, --block-size <size>', 'Maximum size in Kb for each fingerprint block (optional - default 64Kb)')
    .action((source, options) => {wfpHandler(source, options).catch((e) => {CLIErrorHandler(e)})})

    await program.parseAsync(process.argv);
}


try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
