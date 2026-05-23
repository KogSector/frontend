export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return platform features (could be from DB or config)
    const features = [
      {
        id: 'multi-source',
        name: 'Multi-Source Integration',
        description: 'Connect and sync data from GitHub, GitLab, Bitbucket, Confluence, and more',
        icon: 'git-branch',
        category: 'data-integration'
      },
      {
        id: 'ai-search',
        name: 'AI-Powered Search',
        description: 'Natural language search across all your documents with intelligent context understanding',
        icon: 'search',
        category: 'search'
      },
      {
        id: 'knowledge-graph',
        name: 'Knowledge Graph',
        description: 'Automatic relationship discovery and entity linking across your entire codebase',
        icon: 'network',
        category: 'intelligence'
      },
      {
        id: 'real-time-sync',
        name: 'Real-Time Sync',
        description: 'Keep your data synchronized automatically with webhook-based updates',
        icon: 'refresh-cw',
        category: 'sync'
      },
      {
        id: 'embeddings',
        name: 'Smart Embeddings',
        description: 'Advanced vector embeddings for semantic search and similarity matching',
        icon: 'brain',
        category: 'ai'
      },
      {
        id: 'collaboration',
        name: 'Team Collaboration',
        description: 'Share insights, manage access, and collaborate with your team seamlessly',
        icon: 'users',
        category: 'collaboration'
      },
      {
        id: 'security',
        name: 'Enterprise Security',
        description: 'Role-based access control, audit logs, and enterprise-grade security',
        icon: 'shield',
        category: 'security'
      },
      {
        id: 'api-access',
        name: 'API Access',
        description: 'Complete REST API and webhooks for integration with your existing tools',
        icon: 'api',
        category: 'api'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        features,
        categories: [
          { id: 'data-integration', name: 'Data Integration' },
          { id: 'search', name: 'Search & Discovery' },
          { id: 'intelligence', name: 'AI Intelligence' },
          { id: 'sync', name: 'Synchronization' },
          { id: 'ai', name: 'AI Features' },
          { id: 'collaboration', name: 'Collaboration' },
          { id: 'security', name: 'Security' },
          { id: 'api', name: 'API & Integration' }
        ]
      }
    })

  } catch (error) {
    console.error('Error fetching landing features:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch features',
      data: {
        features: [],
        categories: []
      }
    }, { status: 500 })
  }
}
