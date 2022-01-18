# Scanoss JS Package

The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.

It can be installed on your system and used as a CLI or installed directly into your Node.js project.

## Installation

You can install the Scanoss package using npm (the Node Package Manager). Note that you will need to install Node.js and npm. Installing Node.js should install npm as well.

To download and install the Scanoss CLI run the following command: `npm install -g scanoss`

On the other hand, if you need to install the module in your own Node.js project and consume it as a dependency, execute the following command `npm install scanoss`

## CLI Usage

Running the bare command will list the available sub-commands:

```Usage: scanoss-js [options] [command]

The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.

Options:
  -V, --version            output the version number
  -h, --help               display help for command

Commands:
  scan [options] <source>  Scan a folder/file
  help [command]           display help for command
```

From there it is possible to scan a source code folder:

`scanoss-js scan -o scan-output.json <source-folder>`

## Package Usage

The Scanoss package can be used programmatically as a standard Node module.
A simple example that scans two files and writes the result in the project folder is shown below:

```typescript
// Import as ES6
import { Scanner, ScannerEvents, ScannerTypes } from 'scanoss';

// Import as CommonJS
// const { Scanner, ScannerEvents } = require('scanoss');

const scanner = new Scanner();

// Set the folder path where the module will save the scan results and fingerprints
// If is not specified, the module will create a folder on tmp
// directory using a timestamp as a name
scanner.setWorkDirectory('/yourProjectFolder/ScanResults/');

// Set the scanner log event handler
scanner.on(ScannerEvents.SCANNER_LOG, (logTxt) => console.log(logTxt));

// Set the scanner finish event handler
scanner.on(ScannerEvents.SCAN_DONE, (resultPath) => {
  console.log('Path to results: ', resultPath);
});

const scannerInput = {
  fileList: ['/yourProjectFolder/example1.c', '/yourProjectFolder/example2.c'],
};

// Launch the scanner
scanner.scan([scannerInput]);
```

### Events

The module provides a set of events that can be used to trigger actions.
Some events are shown in the example above.

| Event Name          | Description                         |
| ------------------- | ----------------------------------- |
| SCANNER_LOG         | Report any internal scanner events  |
| SCAN_DONE           | Scan completed                      |
| DISPATCHER_NEW_DATA | New data received but not persisted |
| RESULTS_APPENDED    | Results added to scan report file   |

# Build and publish the module

In order to build and publish the package is a requisite to have installed `yarn`. For more information https://yarnpkg.com/getting-started/install

- `yarn install` will install the dependencies.
- `yarn build` will build the module.
- `yarn publish` will publish the module.
