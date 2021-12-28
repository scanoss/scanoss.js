# Scanoss.js

The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.


# Installation
You can install the Scanoss package using npm (the Node Package Manager). Note that you will need to install Node.js and npm. Installing Node.js should install npm as well.

To download and install the Scanoss package in your project run the following command:

```
npm install scanoss.js
```


# Using as a Module
The Scanoss package can used programmatically as a standard Node module. 
A simple example that scans two files and writes the result in the project folder is shown below:


```typescript
// Import as ES6
import { Scanner, ScannerEvents } from 'scanoss-ts';

// Import as CommonJS
// const { Scanner, ScannerEvents } = require('scanoss-ts');
  
const scanner = new  Scanner();


// Set the folder path where the module will save the scan results and fingerprints
// If is not specified, the module will create a folder on tmp 
// directory using a timestamp as a name
scanner.setWorkDirectory('/yourProjectFolder/ScanResults/');

// Set the scanner log event handler
scanner.on(ScannerEvents.SCANNER_LOG, (logTxt) =>  console.log(logTxt));

// Set the scanner finish event handler
scanner.on(ScannerEvents.SCAN_DONE, (resultPath) =>  {
	console.log('Path to results: ',resultPath)
});

// Launch the scanner
scanner.scanList({
  '/yourProjectFolder/example1.c':  'FULL_SCAN',
  '/yourProjectFolder/example2.c':  'FULL_SCAN'
  });
```


## Events
The module provides a set of events that can be used to trigger actions. 
Some events are shown in the example above.


| Event Name             | Description                          |
| -----------            | -----------                          |
| SCANNER_LOG            | Report any internal scanner events   |
| SCAN_DONE              | Scan completed                       |
| DISPATCHER_NEW_DATA    | New data received but not persisted  |
| RESULTS_APPENDED       | Results added to scan report file    |

# Build and publish the module 
In order to build and publish the package is a requisite to have installed `yarn`. For more information https://yarnpkg.com/getting-started/install

```
yarn build
```

```
yarn publish
```
