#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Building Syft WASM module..."
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
  echo "❌ Error: Go is not installed"
  echo "   Please install Go 1.24 or later: https://go.dev/dl/"
  exit 1
fi

# Check Go version
GO_VERSION=$(go version | awk '{print $3}')
echo "✓ Found Go: $GO_VERSION"
echo ""

# Build WASM
cd "$PROJECT_ROOT/wasm"
./build.sh

echo ""
echo "✅ Syft WASM build complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run 'npm run build' to compile TypeScript"
echo "   2. Run 'npm test' to verify everything works"
echo ""
