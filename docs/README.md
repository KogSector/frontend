# ConFuse Frontend Documentation

## Overview

The frontend is ConFuse's **web interface** — a React/Next.js application for managing data sources, searching knowledge, and configuring the platform.

## Role in ConFuse

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USER                                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ Browser
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (This Service)                           │
│                          Port: 3000                                  │
│                                                                      │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │
│   │   Pages     │   │ Components  │   │   State     │              │
│   │             │   │             │   │             │              │
│   │ • Dashboard │   │ • Search    │   │ • Redux     │              │
│   │ • Sources   │   │ • Results   │   │ • React Q   │              │
│   │ • Settings  │   │ • Source    │   │ • Auth ctx  │              │
│   │ • Search    │   │   cards     │   │             │              │
│   └─────────────┘   └─────────────┘   └─────────────┘              │
│                                                                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ REST API
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API-BACKEND                                  │
│                          Port: 3003                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Features

### 1. Dashboard
- Overview of connected sources
- Sync status and health
- Recent activity
- Quick search

### 2. Source Management
- Connect GitHub, GitLab, Google Drive
- OAuth flow initiation
- Webhook status
- Sync triggers

### 3. Search Interface
- Natural language search
- Filter by source, language, type
- Code syntax highlighting
- Entity relationship visualization

### 4. Settings
- Profile management
- API key generation
- Team/organization settings
- Billing (if applicable)

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Shadcn/UI | Component library |
| React Query | Server state management |
| Zustand | Client state |
| Monaco Editor | Code display |

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx           # Dashboard
│   ├── sources/           # Source management
│   ├── search/            # Search interface
│   └── settings/          # Settings
├── components/            # React components
│   ├── ui/               # Base UI (shadcn)
│   ├── search/           # Search components
│   ├── sources/          # Source components
│   └── layout/           # Layout components
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── auth.ts           # Auth utilities
│   └── utils.ts          # Helpers
├── hooks/                 # Custom hooks
├── store/                 # State management
├── types/                 # TypeScript types
└── public/               # Static assets
```

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit with your API URL

# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API backend URL | `http://localhost:3003` |
| `NEXT_PUBLIC_AUTH_URL` | Auth service URL | `http://localhost:3001` |
| `NEXTAUTH_SECRET` | NextAuth secret | Required |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |

## Pages

### Dashboard (`/`)

```tsx
// Key metrics displayed
- Connected sources count
- Total chunks indexed
- Last sync time
- Search suggestions
```

### Sources (`/sources`)

```tsx
// Source management features
- List connected sources
- Add new source (wizard)
- View sync status
- Trigger manual sync
- Edit source settings
- Disconnect source
```

### Search (`/search`)

```tsx
// Search features
- Natural language input
- Filters sidebar
- Results with syntax highlighting
- Entity relationships visualization
- Copy/share results
```

### Settings (`/settings`)

```tsx
// Configuration options
- Profile (name, email, avatar)
- API keys management
- Team management (if enterprise)
- Integrations
```

## API Integration

### API Client

```typescript
// lib/api.ts
import { QueryClient } from '@tanstack/react-query';

export const api = {
  sources: {
    list: () => fetch('/api/sources').then(r => r.json()),
    create: (data) => fetch('/api/sources', {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(r => r.json()),
    sync: (id) => fetch(`/api/sources/${id}/sync`, { method: 'POST' }),
  },
  search: {
    query: (q, filters) => fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: q, ...filters })
    }).then(r => r.json()),
  },
  apiKeys: {
    list: () => fetch('/api/api-keys').then(r => r.json()),
    create: (name) => fetch('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name })
    }).then(r => r.json()),
  }
};
```

### React Query Hooks

```typescript
// hooks/use-sources.ts
export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: api.sources.list,
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.sources.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
}
```

## Authentication

Uses NextAuth.js with JWT strategy:

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const res = await fetch(`${AUTH_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        const user = await res.json();
        if (res.ok && user) return user;
        return null;
      }
    }),
    // OAuth providers configured via auth-middleware
  ],
  session: { strategy: 'jwt' },
};

export default NextAuth(authOptions);
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel

```bash
vercel deploy
```

## Related Services

| Service | Relationship |
|---------|--------------|
| api-backend | REST API for all operations |
| auth-middleware | OAuth flows, session management |
