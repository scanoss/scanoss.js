#!/usr/bin/env node

import { program } from 'commander';
import { scanHandler } from '../commands/scan';


function CLIErrorHandler(e: Error) {
  console.log('');
  console.error(e);
  process.exit(1);
}

async function main() {
  program
    .version('0.2.0')
    .description('The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.')

  program
    .command('scan <source>')
    .description('Scan a folder/file')
    .option('-c, --concurrency <number>', 'Number of concurrent connections to use while scanning (optional -default 10)')
    .option('-f, --filter <path>', 'Loads an user defined filter (optional)')
    .option('-o, --output <path>', 'Output result directory (optional - default tmp directory)')
    .option('-P, --post-size <postsize>', 'Number of kilobytes to limit the post to while scanning (optional - default 64)')
    .option('-R, --max-retry <retry>', 'Max number of retries for each POST (optional -default 5)')
    .option('-M, --timeout <timeout>', 'Timeout (in seconds) for API communication (optional -default 120)')
    .option('-a, --apiurl <apiurl>', 'SCANOSS API URL (optional - default: https://osskb.org/api/scan/direct)')
    .option('-k, --key <key>', 'SCANOSS API Key token (optional - not required for default OSSKB URL)')
    .option('-v, --verbose', 'Makes scan operation verbose')
    .action((source, options) => {scanHandler(source, options).catch((e) => {CLIErrorHandler(e)})})
    .addHelpText('after', `
  Examples:
    $ scanoss-js scan <yourProjectPath>`
    );


    await program.parseAsync(process.argv);


}


try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
