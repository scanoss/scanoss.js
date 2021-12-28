#!/usr/bin/env node

import { program } from 'commander';


// Sub-Commands
program
.command('scan', 'Scan a folder/file', {executableFile: '../commands/scan.js'}).alias('s')


program
    .version('0.2.0')
    .description('The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.')
    .parse(process.argv);

