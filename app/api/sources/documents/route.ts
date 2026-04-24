export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dataClient } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    console.log('[API /api/sources/documents] GET called, authHeader present:', !!authHeader)

    // Fetch documents directly from data-connector's /api/v1/documents endpoint
    const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {}
    let resp: any

    try {
      resp = await dataClient.get('/api/v1/documents', headers)
      console.log('[API /api/sources/documents] data-connector response:', JSON.stringify(resp))
    } catch (fetchErr: any) {
      console.error('[API /api/sources/documents] Failed to fetch from data-connector:', fetchErr?.message || fetchErr)
      // Return empty array gracefully
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      })
    }

    // data-connector returns { success, message, data: { data: [...], total: ... } }
    if (resp && (resp as any).success && (resp as any).data?.data) {
      return NextResponse.json({
        success: true,
        data: (resp as any).data.data,
        total: (resp as any).data.total || (resp as any).data.data?.length || 0
      })
    } else {
      console.error('[API /api/data/documents] Invalid response format:', resp)
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      })
    }
  } catch (error: any) {
    console.error('[API /api/data/documents] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch documents'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const url = new URL(request.url)
    const docId = url.pathname.split('/').pop()
    
    console.log('[API /api/data/documents] DELETE called for docId:', docId, 'authHeader present:', !!authHeader)

    if (!docId) {
      return NextResponse.json({
        success: false,
        error: 'Document ID is required'
      }, { status: 400 })
    }

    // Delete document from data-connector
    const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {}
    
    try {
      const resp = await dataClient.delete(`/api/v1/documents/${docId}`, headers)
      console.log('[API /api/data/documents] DELETE response:', resp)
      
      if (resp && (resp as any).success) {
        return NextResponse.json({
          success: true,
          message: 'Document deleted successfully'
        })
      } else {
        return NextResponse.json({
          success: false,
          error: (resp as any)?.message || 'Failed to delete document'
        }, { status: 400 })
      }
    } catch (fetchErr: any) {
      console.error('[API /api/data/documents] Failed to delete from data-connector:', fetchErr?.message || fetchErr)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete document'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('[API /api/data/documents] DELETE Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete document'
    }, { status: 500 })
  }
}
