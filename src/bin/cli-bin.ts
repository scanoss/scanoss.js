#!/usr/bin/env node

import { program } from 'commander';
import { depHandler } from '../commands/dep';
import { scanHandler } from '../commands/scan';

function CLIErrorHandler(e: Error) {
  console.error(' ');
  console.error(e);
  process.exit(1);
}




async function main() {
  program
    .version("0.2.19")
    .description('The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.')

  program
    .command('scan <source>')
    .description('Scan a folder/file')
    //.option('-w, --wfp', 'Scan a .wfp file instead of a folder') // In progress
    .option('-c, --concurrency <number>', 'Number of concurrent connections to use while scanning (optional -default 10)')
    .option('--filter <path>', 'Loads an user defined filter (optional)')
    .option('-o, --output <filename>', 'Output result file name (optional - default stdout)')
    .option('-F, --flags <flags>', 'Scanning engine flags (1: disable snippet matching, 2 enable snippet ids, 4: disable dependencies, 8: disable licenses, 16: disable copyrights,32: disable vulnerabilities, 64: disable quality, 128: disable cryptography,256: disable best match, 512: Report identified files)')
    .option('-P, --post-size <postsize>', 'Number of kilobytes to limit the post to while scanning (optional - default 64)')
    .option('-R, --max-retry <retry>', 'Max number of retries for each POST (optional -default 5)')
    .option('-M, --timeout <timeout>', 'Timeout (in seconds) for API communication (optional -default 120)')
    .option('-a, --apiurl <apiurl>', 'SCANOSS API URL (optional - default: https://osskb.org/api/scan/direct)')
    .option('-k, --key <key>', 'SCANOSS API Key token (optional - not required for default OSSKB URL)')
    .option('-v, --verbose', 'Makes scan operation verbose')
    .action((source, options) => {scanHandler(source, options).catch((e) => {CLIErrorHandler(e)})})
    .addHelpText('after', `
  Examples:
    $ scanoss-js scan -o scan-output.json <source-folder>`
    );

    program
    .command('dep <source>')
    .description('Scan for dependencies [ BETA ]')
    .option('-o, --output <filename>', 'Output result file name (optional - default stdout)')
    .option('-a, --grpc-host <host>', 'SCANOSS GRPC HOST (optional - default: scanoss.com)')
    .option('-p, --grpc-port <port>', 'SCANOSS GRPC PORT  (optional - default: 443)')

    .action((source, options) => {depHandler(source, options).catch((e) => {CLIErrorHandler(e)})})

    await program.parseAsync(process.argv);
}


try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
