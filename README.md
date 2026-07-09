# ConFuse Frontend

**Port**: 3000  
**Technology**: Next.js, React, Tailwind CSS

## Overview

Web interface for the ConFuse Knowledge Intelligence Platform. Provides:

- **Dashboard**: System status and metrics
- **Source Management**: Connect and manage data sources
- **Knowledge Search**: Search across code and documents
- **Settings**: Configuration and API management

## Features

### Dashboard
- Real-time system status
- Processing metrics
- Source connectivity overview

### Source Management
- Connect GitHub repositories
- Link document storage (Google Drive, Notion)
- Monitor sync status
- Configure processing options

### Knowledge Search
- Unified search across code and documents
- Filter by source, file type, date
- View file content and metadata

### Settings
- API key management
- Service configuration
- User preferences

## Architecture

```
┌─────────────────────────────────────────────────┐
│                Frontend (:3000)                 │
├─────────────────────────────────────────────────┤
│  Dashboard  │  Search  │  Sources  │  Settings  │
└─────────────┴─────────┴───────────┴─────────────┘
        │                │                │
        ▼                ▼                ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│Auth Middleware│ │Data Connector│ │Search API   │
│    (3010)    │ │    (8080)    │ │   (TBD)     │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Development

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### Setup
```bash
# Install dependencies
npm install

# Environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Build
```bash
# Production build
npm run build

# Start production server
npm start
```

## Configuration

### Environment Variables
```bash
# API URLs
NEXT_PUBLIC_API_URL=https://unified-processor.onrender.com
NEXT_PUBLIC_AUTH_URL=https://auth-middleware-k3bb.onrender.com

# NextAuth configuration (if applicable)
NEXTAUTH_URL=https://frontend-alpha-bay-60.vercel.app

# Features
NEXT_PUBLIC_ENABLE_SEARCH=true
NEXT_PUBLIC_ENABLE_SOURCES=true
```

## Deployment

### Docker
```bash
docker build -t confuse/frontend .
docker run -p 3000:3000 confuse/frontend
```

### Kubernetes
```bash
kubectl apply -f k8s/frontend.yaml
```

## Contributing

1. Follow Next.js conventions
2. Use Tailwind CSS for styling
3. Test responsive design
4. Update documentation

## How to run the microservice

```bash
npm install
npm run dev
```
