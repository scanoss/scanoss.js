# Syft WASM Module

This directory contains the Go code that compiles to WebAssembly for parsing dependency files using Syft's catalogers.

## Requirements

- Go 1.24 or later
- WASM support (`GOOS=js GOARCH=wasm`)

## Building

```bash
# From this directory
./build.sh

# Or from project root
npm run build:wasm
```

This will:
1. Download Syft and dependencies via `go mod download`
2. Compile to WASM (`syft.wasm`)
3. Copy WASM and runtime to `src/sdk/Dependencies/SyftWasm/assets/`

## Architecture

- **main.go** - WASM entry point, registers JS functions
- **api.go** - JavaScript bridge layer with Promise-based API
- **types.go** - Data structures shared between Go and JS
- **parsers.go** - Syft cataloger integration and in-memory file resolver
- **go.mod** - Go module definition with Syft dependency

## Supported File Types

Uses Syft's official catalogers for:
- **npm** - package.json, package-lock.json
- **Python** - requirements.txt, Pipfile.lock, pyproject.toml
- **Go** - go.mod, go.sum
- **Maven** - pom.xml
- **Rust** - Cargo.toml, Cargo.lock
- **Ruby** - Gemfile, Gemfile.lock

## Updating Syft

```bash
go get github.com/anchore/syft@v1.17.0
go mod tidy
./build.sh
```

## API

The WASM module exports these JavaScript functions:

```javascript
// Get version
syftGetVersion(): string

// Parse single file
syftParseFile(path: string, content: string, type?: string): Promise<ParseResult>

// Parse multiple files
syftParseFiles(files: FileInput[]): Promise<ParseResult>
```

## Development

Test locally after building:
```bash
cd ../poc-wasm
node test.js
```
