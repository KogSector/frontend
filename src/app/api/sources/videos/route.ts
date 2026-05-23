export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dataClient } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || ''
    const userIdHeader = request.headers.get('x-user-id') || ''
    const headers: Record<string, string> = {}
    if (authHeader) headers['Authorization'] = authHeader
    if (userIdHeader) headers['x-user-id'] = userIdHeader

    const form = await request.formData()
    // mark type as video so backend can handle differently if needed
    if (!form.get('doc_type')) form.append('doc_type', 'video')

    // Forward to data-connector upload endpoint (documents upload handles video ingestion)
    const resp = await dataClient.postForm('/api/v1/documents/upload', form, headers)
    return NextResponse.json(resp)
  } catch (error: any) {
    console.error('[API /api/sources/videos] Error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to upload video' }, { status: 500 })
  }
}
