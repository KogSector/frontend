# ConFuse Frontend

Web interface for the ConFuse Knowledge Intelligence Platform. Built with Next.js, React, and Tailwind CSS.

## Overview

This is the **web interface** that provides:
- Dashboard with source status
- Source connection management
- Knowledge search interface
- Settings and API key management

## Architecture

See [docs/README.md](docs/README.md) for complete documentation.

## Quick Start

```bash
# Install dependencies
npm install

# Configure
cp .env.example .env.local

# Development
npm run dev

# Build for production
npm run build
npm start
```

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Components
- **React Query** - Data fetching

## Pages

| Page | Description |
|------|-------------|
| `/` | Dashboard |
| `/sources` | Source management |
| `/search` | Knowledge search |
| `/settings` | Configuration |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API backend URL |
| `NEXTAUTH_SECRET` | NextAuth secret |

## Documentation

See [docs/](docs/) folder for complete documentation.

## License

MIT - ConFuse Team
