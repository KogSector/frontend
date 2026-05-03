export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dataClient } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    // Expecting multipart/form-data with file(s) or url field
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || ''
    const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {}

    const form = await request.formData()
    // mark type as ebook so backend can handle differently if needed
    if (!form.get('doc_type')) form.append('doc_type', 'ebook')

    // Forward to data-connector upload endpoint
    const resp = await dataClient.postForm('/api/v1/documents/upload', form, headers)
    return NextResponse.json(resp)
  } catch (error: any) {
    console.error('[API /api/sources/ebooks] Error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to upload ebook' }, { status: 500 })
  }
}
