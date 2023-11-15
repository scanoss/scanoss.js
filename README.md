<div align='left'>

[![REUSE status](https://api.reuse.software/badge/github.com/scanoss/scanoss.js)](https://api.reuse.software/info/github.com/scanoss/scanoss.js)
![Build and Test status](https://github.com/scanoss/scanoss.js/actions/workflows/build_test.yml/badge.svg)
</div>




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
Usage: scanoss-js [options] [command]

The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.

Options:
  -V, --version            output the version number
  -h, --help               display help for command

Commands:
  scan [options] <source>  Scan a folder/file
  dep [options] <source>   Scan for dependencies
  wfp [options] <source>   Generates fingerprints for a folder/file
  help [command]           display help for command
```

### Command `scan`

* For a quick and free analysis of your project, simply input: `scanoss-js scan -o results.json <source-folder>`


* Using an API Token for Scanning: `scanoss-js scan -o results.json --key <your_token> --apiurl <your_apiurl> <source-folder>`


* Include Dependency detection in scanning: `scanoss-js scan -o results.json --dependencies <source-folder>`

### Command `wfp`
* Generate Hashes without analysis: `scanoss-js wfp -o fingerprints.wfp <source-folder>`

 
* Subsequent scanning of previously generated Hashes: `scanoss-js scan -w fingerprints.wfp -o results.json`

Note: the --dependencies flag is not applicable here, given that manifest files aren't encompassed within the hashes.



### Command `dep`
* Focus Exclusively on Dependencies: `scanoss-js dep .`

The manifest files acknowledged during the scanning process are:

    * Python: requirements.txt
    * Java: pom.xml
    * Javascript: package.json, package-lock.json, yarn.lock
    * Ruby: Gemfile, Gemfile.lock
    * Golang: go.mod, go.sum
    * .NET/NuGet: *.csproj, packages.config
    * Gradle: build.gradle




## SDK Usage
The SDK provides a simple way to interact with the Scanoss APIs from your JS code. Here are two examples for performing code scanning and dependency scanning

### Code Scanning 

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

The scanner object provides a set of events that can be used to trigger custom actions. 
These events are listed in the table above and were previously mentioned.

| Event Name          | Description                         |
| ------------------- | ----------------------------------- |
| SCANNER_LOG         | Report any internal scanner events  |
| SCAN_DONE           | Scan completed                      |
| DISPATCHER_NEW_DATA | New data received but not persisted |
| RESULTS_APPENDED    | Results added to scan report file   |




## Local Development and Usage
If you want to develop this package and use it locally in your project (without publishing it), follow these steps:

#### 1 - Creating a Symbolic Link for the Development Package:
In the root of the scanoss.js package, run the command:

```bash
npm install && npm run build && npm link . 
```
This command creates a global symbolic link in your system that points to the local location of your package. This means you can use the package in any other Node.js project on your machine as if it were installed globally.

#### 2 - Using the Package in Your Project:

In the root of the project where you want to use the scanoss package, run the command:

```bash
npm link scanoss
```
This will create a symbolic link in your project to the globally linked scanoss package. Any changes made in the package will be immediately reflected in the consuming project.

#### 3 - Disconnecting the Link:

Remember that once you finish developing or using the package locally, you should break the link to avoid potential issues with future versions or with installing other packages. To do this, simply run:

```bash
npm unlink scanoss
```
in both the project and the scanoss package. This will remove the symbolic links and restore the normal state of the packages.

