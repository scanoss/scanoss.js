<div align='left'>

[![REUSE status](https://api.reuse.software/badge/github.com/scanoss/scanoss.js)](https://api.reuse.software/info/github.com/scanoss/scanoss.js)
![Build and Test status](https://github.com/scanoss/scanoss.js/actions/workflows/build_test.yml/badge.svg)
</div>


# ** WARNING ** : Work In Progress 

# Scanoss JS Package

The SCANOSS JS package provides a simple, easy to consume module for interacting with SCANOSS APIs/Engine.

It can be installed on your system and used as a CLI or installed directly into your Node.js project.

## Installation

You can install the Scanoss package using npm (the Node Package Manager). Note that you will need to install Node.js and npm. Installing Node.js should install npm as well.

To download and install the Scanoss CLI run the following command: `npm install -g scanoss`

On the other hand, if you need to install the module in your own Node.js project and consume it as a dependency, execute the following command `npm install scanoss`



## SDK Basic Usage

```javascript
import { ScanossSDK } from 'scanoss';

// Initialize the SDK with your API key
const sdk = new ScanossSDK('your-api-key-here');

// Example: Analyze dependencies
const dependencies = await sdk.dependencies.decorate(dependencyList);

// Example: Scan a folder
const scanResult = await sdk.scanning.scanFolder('./project');

// Example: Check vulnerabilities
const vulnerabilities = await sdk.vulnerability.check(purls);

// Example: Analyze cryptography usage
const cryptoUsage = await sdk.crypto.analyze(files);
```

## Namespaces

The SCANOSS SDK is organized into several namespaces, each focusing on a specific area of functionality:

### Dependencies Namespace

The `dependencies` namespace provides tools for analyzing and managing project dependencies.

```javascript
// Decorate a list of dependencies with additional information
const decoratedDeps = await sdk.dependencies.decorate(dependencyList);

// Parse dependency files
const purls = sdk.dependencies.fromFiles(['package.json', 'requirements.txt']).getPurls();
```

### Scanning Namespace

The `scanning` namespace offers functionality for scanning codebases and identifying components.

```javascript
// Scan a folder
const scanResult = await sdk.scanning.scanFolder('./project');

// Generate fingerprints for a list of files
const fingerprints = sdk.scanning.fingerprintFiles(fileList);
```

### Vulnerability Namespace

The `vulnerability` namespace provides tools for checking and analyzing vulnerabilities in your dependencies.

```javascript
// Check vulnerabilities for a list of PURLs
const vulnerabilities = await sdk.vulnerability.check(purlList);

// Get detailed information about a specific vulnerability
const vulnDetails = await sdk.vulnerability.getDetails(vulnId);
```

### Crypto Namespace

The `crypto` namespace offers functionality for analyzing cryptography usage in your codebase.

```javascript
// Analyze cryptography usage in a list of files
const cryptoUsage = await sdk.crypto.analyze(fileList);

// Get information about supported cryptographic algorithms
const algorithms = await sdk.crypto.getAlgorithms();
```

## Error Handling

The SDK uses custom error classes for different types of errors. 

```javascript
try {
  const result = await sdk.dependencies.decorate(dependencyList);
} catch (error) {
  if (error instanceof TransportNotSetError) {
    console.error('API key not set or invalid');
  } else {
    console.error('An error occurred:', error.message);
  }
}
```



