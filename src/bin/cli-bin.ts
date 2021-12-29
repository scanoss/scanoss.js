#!/usr/bin/env node

import { program } from 'commander';
import { scanHandler } from '../commands/scan';


async function main() {
  program
    .version('0.2.0')
    .description('The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.')

  program
    .command('scan <source>')
    .description('Scan a folder/file')
    //.option('-e, --exec_mode <mode>', 'Which exec mode to use', 'fast')
    .action((source, options) => {scanHandler(source, options)})
    .addHelpText('after', `
  Examples:
    $ scanoss-js scan <yourProjectPath>`
    );

  await program.parseAsync(process.argv);
}



main();
