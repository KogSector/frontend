export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dataApiClient } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    console.log('[API /api/repositories] GET called, authHeader present:', !!authHeader)

    // Fetch repositories directly from data-connector's /api/repositories endpoint
    const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {}
    let resp: any

    try {
      resp = await dataApiClient.get('/api/repositories', headers)
      console.log('[API /api/repositories] data-connector response:', JSON.stringify(resp))
    } catch (fetchErr: any) {
      console.error('[API /api/repositories] Failed to fetch from data-connector:', fetchErr?.message || fetchErr)
      // Return empty array gracefully
      return NextResponse.json({
        success: true,
        data: { repositories: [] }
      })
    }

    // data-connector returns { success, message, data: { repositories: [...] } }
    if (resp && resp.success && resp.data?.repositories) {
      const repositories = resp.data.repositories.map((repo: any) => ({
        id: repo.id,
        name: repo.name || 'Unknown',
        description: `${repo.provider || 'git'} repository`,
        language: 'Unknown',
        stars: 0,
        forks: 0,
        lastUpdated: repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : 'recently',
        status: repo.status === 'active' ? 'active' :
          repo.status === 'syncing' ? 'syncing' :
            repo.status === 'error' ? 'error' : 'inactive',
        url: repo.url || '',
        provider: repo.provider || 'github',
        defaultBranch: repo.branch || 'main',
      }))

      console.log('[API /api/repositories] Returning', repositories.length, 'repositories')

      return NextResponse.json({
        success: true,
        data: { repositories }
      })
    }

    console.log('[API /api/repositories] No repositories in response, returning empty')
    return NextResponse.json({
      success: true,
      data: { repositories: [] }
    })
  } catch (error: any) {
    console.error('[API /api/repositories] Error:', error?.message || error)
    return NextResponse.json({
      success: true,
      data: { repositories: [] }
    })
  }
}
