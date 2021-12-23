# Scanoss-ts

The SCANOSS JS package provides a simple, easy to consume library for interacting with SCANOSS APIs/Engine.


# Usage

```typescript
// Import as ES6
import { Scanner, ScannerEvents } from 'scanoss-ts';

// Import as CommonJS
// const { Scanner, ScannerEvents } = require('scanoss-ts');
  
const  scanner = new  Scanner();


// Sets where to write the scan results. 
// If not specified, the library will create a folder on tmp 
// directory using a timestamp as a name
scanner.setWorkDirectory('./');

// Set the scanner log event handler
scanner.on(ScannerEvents.SCANNER_LOG, (txt) =>  console.log(txt));

// Set the scanner finish event handler
scanner.on(ScannerEvents.SCAN_DONE, (resultPath) =>  {
	console.log('Path to results: ',resultPath)
});

// Launch the scanner
scanner.scanList({'/home/ubuntu/Downloads/example.c':  'FULL_SCAN'});
```
# Installation
```
 npm install scanoss-ts  
```
or
```
yarn install scanoss-ts
```

# How to build
In order to build the library is a requisite to have installed `yarn`. For more information https://yarnpkg.com/getting-started/install
```
yarn build
```

# How to publish
