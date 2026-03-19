export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dataApiClient } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    console.log('[API /api/sources/repositories] GET called, authHeader present:', !!authHeader)

    // Fetch repositories directly from data-connector's /api/repositories endpoint
    const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {}
    let resp: any

    try {
      resp = await dataApiClient.get('/api/repositories', headers)
      console.log('[API /api/sources/repositories] data-connector response:', JSON.stringify(resp))
    } catch (fetchErr: any) {
      console.error('[API /api/sources/repositories] Failed to fetch from data-connector:', fetchErr?.message || fetchErr)
      // Return empty array gracefully
      return NextResponse.json({
        success: true,
        data: { repositories: [] }
      })
    }

    // data-connector returns { success, message, data: { repositories: [...] } }
    if (resp && (resp as any).success && (resp as any).data?.repositories) {
      return NextResponse.json({
        success: true,
        data: { repositories: (resp as any).data.repositories }
      })
    } else {
      console.error('[API /api/data-sources/repositories] Invalid response format:', resp)
      return NextResponse.json({
        success: true,
        data: { repositories: [] }
      })
    }
  } catch (error: any) {
    console.error('[API /api/data-sources/repositories] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch repositories'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const url = new URL(request.url)
    const repoId = url.pathname.split('/').pop()
    
    console.log('[API /api/data-sources/repositories] DELETE called for repoId:', repoId, 'authHeader present:', !!authHeader)

    if (!repoId) {
      return NextResponse.json({
        success: false,
        error: 'Repository ID is required'
      }, { status: 400 })
    }

    // Delete repository from data-connector
    const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {}
    
    try {
      const resp = await dataApiClient.delete(`/api/repositories/${repoId}`, headers)
      console.log('[API /api/data-sources/repositories] DELETE response:', resp)
      
      if (resp && (resp as any).success) {
        return NextResponse.json({
          success: true,
          message: 'Repository deleted successfully'
        })
      } else {
        return NextResponse.json({
          success: false,
          error: (resp as any)?.message || 'Failed to delete repository'
        }, { status: 400 })
      }
    } catch (fetchErr: any) {
      console.error('[API /api/data-sources/repositories] Failed to delete from data-connector:', fetchErr?.message || fetchErr)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete repository'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('[API /api/data-sources/repositories] DELETE Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete repository'
    }, { status: 500 })
  }
}
