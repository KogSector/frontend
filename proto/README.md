# Protocol Buffers for ConFuse Platform

This directory contains Protocol Buffer definitions for gRPC communication between ConFuse services.

## Files

- **unified_processor.proto** - Service definition for unified-processor
- **generate_stubs.ps1** - Windows PowerShell stub generation script
- **generate_stubs.sh** - Linux/macOS bash stub generation script

## Quick Start

### Windows
```powershell
.\generate_stubs.ps1
```

### Linux/macOS
```bash
chmod +x generate_stubs.sh
./generate_stubs.sh
```

## What Gets Generated

### Python Stubs (data-connector)
Location: `../data-connector/app/infra/grpc/generated/`

Files:
- `unified_processor_pb2.py` - Message definitions
- `unified_processor_pb2_grpc.py` - Service stubs
- `unified_processor_pb2.pyi` - Type hints

### Rust Stubs (unified-processor)
Location: `../unified-processor/src/proto/`

Generated during `cargo build` via `build.rs`

## Service Definition

### UnifiedProcessor Service

```protobuf
service UnifiedProcessor {
  rpc ProcessFile(ProcessFileRequest) returns (ProcessFileResponse);
  rpc ProcessBatch(ProcessBatchRequest) returns (ProcessBatchResponse);
  rpc StreamFiles(stream FileChunk) returns (stream ProcessingResult);
  rpc HealthCheck(HealthCheckRequest) returns (HealthCheckResponse);
  rpc GetStatus(StatusRequest) returns (StatusResponse);
}
```

### Key Messages

- **ProcessFileRequest** - Single file processing request
- **ProcessFileResponse** - Processing result with chunks and stats
- **ProcessBatchRequest** - Batch processing with concurrency control
- **ProcessBatchResponse** - Batch results with timing
- **FileChunk** - Streaming file chunk
- **ProcessingResult** - Streaming processing result
- **HealthCheckResponse** - Service health and capabilities
- **StatusResponse** - Job status and progress

## Adding New Services

1. Create new `.proto` file in this directory
2. Update `generate_stubs.ps1` and `generate_stubs.sh`
3. Add to `build.rs` in Rust services
4. Run generation scripts
5. Implement service in both client and server

## Versioning

Proto files use semantic versioning in the package name:
```protobuf
package confuse.processor.v1;
```

When making breaking changes, create a new version (v2, v3, etc.)

## Best Practices

1. Always use explicit field numbers
2. Never reuse field numbers
3. Use `reserved` for deprecated fields
4. Document all messages and fields
5. Use consistent naming (snake_case for fields)
6. Version your services (v1, v2, etc.)

## Troubleshooting

### "protoc not found"
Install Protocol Buffers compiler:
- Windows: `choco install protoc`
- macOS: `brew install protobuf`
- Linux: `apt-get install protobuf-compiler`

### "grpc_tools not found"
Install Python gRPC tools:
```bash
pip install grpcio-tools
```

### "tonic-build not found"
Add to `Cargo.toml`:
```toml
[build-dependencies]
tonic-build = "0.10"
```

## References

- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [gRPC Documentation](https://grpc.io/docs/)
- [Tonic (Rust gRPC)](https://github.com/hyperium/tonic)
