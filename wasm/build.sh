#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSETS_DIR="${SCRIPT_DIR}/../src/sdk/Dependencies/SyftWasm/assets"

echo "🏗️  Building Syft WASM..."

# Download dependencies if needed
echo "📦 Downloading Go dependencies..."
go mod download
go mod tidy

# Build the WASM binary
echo "🔨 Compiling Go to WASM..."
export GOOS=js
export GOARCH=wasm
go build -o syft.wasm .

# Create assets directory
mkdir -p "$ASSETS_DIR"

# Copy WASM binary
cp syft.wasm "$ASSETS_DIR/"
echo "✓ Copied syft.wasm to $ASSETS_DIR/"

# Copy wasm_exec.js from Go runtime
# Try multiple locations
WASM_EXEC_JS=""
LOCATIONS=(
  "$(go env GOROOT)/misc/wasm/wasm_exec.js"
  "/usr/local/go/lib/wasm/wasm_exec.js"
  "/usr/local/go/misc/wasm/wasm_exec.js"
)

for loc in "${LOCATIONS[@]}"; do
  if [ -f "$loc" ]; then
    WASM_EXEC_JS="$loc"
    break
  fi
done

if [ -n "$WASM_EXEC_JS" ]; then
  cp "$WASM_EXEC_JS" "$ASSETS_DIR/"
  echo "✓ Copied wasm_exec.js"
else
  echo "⚠ wasm_exec.js not found. Tried:"
  printf '  %s\n' "${LOCATIONS[@]}"
  exit 1
fi

# Get binary size
WASM_SIZE=$(du -h "$ASSETS_DIR/syft.wasm" | cut -f1)
echo ""
echo "✅ Build complete!"
echo "   WASM binary: $ASSETS_DIR/syft.wasm ($WASM_SIZE)"
echo ""
