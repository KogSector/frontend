#!/bin/bash
# Generate gRPC stubs for Python and Rust

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROTO_DIR="$SCRIPT_DIR"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Generating gRPC Stubs ==="
echo "Proto directory: $PROTO_DIR"
echo "Project root: $PROJECT_ROOT"

# ============================================================================
# Python Stubs (for data-connector)
# ============================================================================
echo ""
echo "Generating Python stubs..."

PYTHON_OUT_DIR="$PROJECT_ROOT/data-connector/app/infra/grpc/generated"
mkdir -p "$PYTHON_OUT_DIR"

# Create __init__.py
touch "$PYTHON_OUT_DIR/__init__.py"

# Generate Python stubs
python -m grpc_tools.protoc \
  -I"$PROTO_DIR" \
  --python_out="$PYTHON_OUT_DIR" \
  --grpc_python_out="$PYTHON_OUT_DIR" \
  --pyi_out="$PYTHON_OUT_DIR" \
  "$PROTO_DIR/unified_processor.proto"

echo "✓ Python stubs generated in $PYTHON_OUT_DIR"

# Fix imports in generated files (Python gRPC has import issues)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' 's/import unified_processor_pb2/from . import unified_processor_pb2/g' \
    "$PYTHON_OUT_DIR/unified_processor_pb2_grpc.py"
else
  # Linux
  sed -i 's/import unified_processor_pb2/from . import unified_processor_pb2/g' \
    "$PYTHON_OUT_DIR/unified_processor_pb2_grpc.py"
fi

echo "✓ Fixed Python imports"

# ============================================================================
# Rust Stubs (for unified-processor)
# ============================================================================
echo ""
echo "Generating Rust stubs..."

# Rust stubs are generated via build.rs during cargo build
# We just need to ensure build.rs exists

BUILD_RS="$PROJECT_ROOT/unified-processor/build.rs"

if [ ! -f "$BUILD_RS" ]; then
  echo "Creating build.rs for unified-processor..."
  cat > "$BUILD_RS" << 'EOF'
fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_server(true)
        .build_client(false)
        .out_dir("src/proto")
        .compile(
            &["../proto/unified_processor.proto"],
            &["../proto"],
        )?;
    Ok(())
}
EOF
  echo "✓ Created build.rs"
else
  echo "✓ build.rs already exists"
fi

# Create proto module directory
RUST_PROTO_DIR="$PROJECT_ROOT/unified-processor/src/proto"
mkdir -p "$RUST_PROTO_DIR"

# Create mod.rs for proto module
cat > "$RUST_PROTO_DIR/mod.rs" << 'EOF'
//! Generated protobuf definitions

pub mod unified_processor {
    tonic::include_proto!("confuse.processor.v1");
}

pub use unified_processor::*;
EOF

echo "✓ Created Rust proto module"

# ============================================================================
# Verification
# ============================================================================
echo ""
echo "=== Verification ==="

if [ -f "$PYTHON_OUT_DIR/unified_processor_pb2.py" ]; then
  echo "✓ Python pb2 file exists"
else
  echo "✗ Python pb2 file missing"
  exit 1
fi

if [ -f "$PYTHON_OUT_DIR/unified_processor_pb2_grpc.py" ]; then
  echo "✓ Python gRPC file exists"
else
  echo "✗ Python gRPC file missing"
  exit 1
fi

echo ""
echo "=== Success ==="
echo "Python stubs: $PYTHON_OUT_DIR"
echo "Rust stubs: Will be generated during 'cargo build'"
echo ""
echo "Next steps:"
echo "1. cd unified-processor && cargo build"
echo "2. Test with: python ConFuse-test-module/data_connector/test_grpc.py"
