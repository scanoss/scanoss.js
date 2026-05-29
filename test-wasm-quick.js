#!/usr/bin/env node
// Quick test for Syft WASM module

const fs = require('fs');
const path = require('path');

// Load wasm_exec.js
const wasmExecPath = path.join(__dirname, 'src/sdk/Dependencies/SyftWasm/assets/wasm_exec.js');
require(wasmExecPath);

async function test() {
  console.log('🧪 Testing Syft WASM...\n');

  try {
    // Load WASM
    const wasmPath = path.join(__dirname, 'src/sdk/Dependencies/SyftWasm/assets/syft.wasm');
    const wasmBuffer = fs.readFileSync(wasmPath);

    const go = new Go();
    const result = await WebAssembly.instantiate(wasmBuffer, go.importObject);

    // Run Go program
    go.run(result.instance);

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    // Test 1: Version
    console.log('✓ Version:', syftGetVersion());

    // Test 2: Parse package.json
    const packageJson = JSON.stringify({
      name: 'test-app',
      version: '1.0.0',
      dependencies: {
        express: '^4.18.0',
        lodash: '~4.17.21'
      }
    });

    console.log('\n📦 Parsing package.json...');
    const npmResult = await syftParseFile('package.json', packageJson);
    console.log(`  Found ${npmResult.packages.length} packages`);
    npmResult.packages.forEach(pkg => {
      console.log(`  - ${pkg.name}@${pkg.version}`);
      console.log(`    PURL: ${pkg.purl}`);
    });

    // Test 3: Parse requirements.txt
    const requirements = `requests==2.28.0
flask==2.0.1
django>=3.2`;

    console.log('\n🐍 Parsing requirements.txt...');
    const pyResult = await syftParseFile('requirements.txt', requirements);
    console.log(`  Found ${pyResult.packages.length} packages`);
    pyResult.packages.forEach(pkg => {
      console.log(`  - ${pkg.name}@${pkg.version || '(any)'}`);
      console.log(`    PURL: ${pkg.purl}`);
    });

    // Test 4: Parse go.mod
    const goMod = `module example.com/myapp

go 1.21

require (
    github.com/gin-gonic/gin v1.9.0
    github.com/spf13/cobra v1.7.0
)`;

    console.log('\n🔷 Parsing go.mod...');
    const goResult = await syftParseFile('go.mod', goMod);
    console.log(`  Found ${goResult.packages.length} packages`);
    goResult.packages.forEach(pkg => {
      console.log(`  - ${pkg.name}@${pkg.version}`);
      console.log(`    PURL: ${pkg.purl}`);
    });

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();
