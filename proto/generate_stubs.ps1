# Generate gRPC stubs for Python and Rust (Windows PowerShell)

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROTO_DIR = $SCRIPT_DIR
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

Write-Host "=== Generating gRPC Stubs ===" -ForegroundColor Cyan
Write-Host "Proto directory: $PROTO_DIR"
Write-Host "Project root: $PROJECT_ROOT"

# ============================================================================
# Python Stubs (for data-connector)
# ============================================================================
Write-Host ""
Write-Host "Generating Python stubs..." -ForegroundColor Yellow

$PYTHON_OUT_DIR = Join-Path $PROJECT_ROOT "data-connector\app\infra\grpc\generated"
New-Item -ItemType Directory -Force -Path $PYTHON_OUT_DIR | Out-Null

# Create __init__.py
New-Item -ItemType File -Force -Path (Join-Path $PYTHON_OUT_DIR "__init__.py") | Out-Null

# Generate Python stubs
python -m grpc_tools.protoc `
  -I"$PROTO_DIR" `
  --python_out="$PYTHON_OUT_DIR" `
  --grpc_python_out="$PYTHON_OUT_DIR" `
  --pyi_out="$PYTHON_OUT_DIR" `
  "$PROTO_DIR\unified_processor.proto"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Python stubs" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Python stubs generated in $PYTHON_OUT_DIR" -ForegroundColor Green

# Fix imports in generated files
$grpcFile = Join-Path $PYTHON_OUT_DIR "unified_processor_pb2_grpc.py"
if (Test-Path $grpcFile) {
    (Get-Content $grpcFile) -replace 'import unified_processor_pb2', 'from . import unified_processor_pb2' | Set-Content $grpcFile
    Write-Host "✓ Fixed Python imports" -ForegroundColor Green
}

# ============================================================================
# Rust Stubs (for unified-processor)
# ============================================================================
Write-Host ""
Write-Host "Generating Rust stubs..." -ForegroundColor Yellow

$BUILD_RS = Join-Path $PROJECT_ROOT "unified-processor\build.rs"

if (-not (Test-Path $BUILD_RS)) {
    Write-Host "Creating build.rs for unified-processor..."
    
    $buildRsContent = @'
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
'@
    
    Set-Content -Path $BUILD_RS -Value $buildRsContent
    Write-Host "✓ Created build.rs" -ForegroundColor Green
} else {
    Write-Host "✓ build.rs already exists" -ForegroundColor Green
}

# Create proto module directory
$RUST_PROTO_DIR = Join-Path $PROJECT_ROOT "unified-processor\src\proto"
New-Item -ItemType Directory -Force -Path $RUST_PROTO_DIR | Out-Null

# Create mod.rs for proto module
$modRsContent = @'
//! Generated protobuf definitions

pub mod unified_processor {
    tonic::include_proto!("confuse.processor.v1");
}

pub use unified_processor::*;
'@

Set-Content -Path (Join-Path $RUST_PROTO_DIR "mod.rs") -Value $modRsContent
Write-Host "✓ Created Rust proto module" -ForegroundColor Green

# ============================================================================
# Verification
# ============================================================================
Write-Host ""
Write-Host "=== Verification ===" -ForegroundColor Cyan

$pb2File = Join-Path $PYTHON_OUT_DIR "unified_processor_pb2.py"
$grpcFile = Join-Path $PYTHON_OUT_DIR "unified_processor_pb2_grpc.py"

if (Test-Path $pb2File) {
    Write-Host "✓ Python pb2 file exists" -ForegroundColor Green
} else {
    Write-Host "✗ Python pb2 file missing" -ForegroundColor Red
    exit 1
}

if (Test-Path $grpcFile) {
    Write-Host "✓ Python gRPC file exists" -ForegroundColor Green
} else {
    Write-Host "✗ Python gRPC file missing" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Success ===" -ForegroundColor Green
Write-Host "Python stubs: $PYTHON_OUT_DIR"
Write-Host "Rust stubs: Will be generated during 'cargo build'"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. cd unified-processor && cargo build"
Write-Host "2. Test with: python ConFuse-test-module/data_connector/test_grpc.py"
