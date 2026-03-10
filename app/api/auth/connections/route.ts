import { NextRequest, NextResponse } from 'next/server'
import { authClient } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || undefined
    const resp = await authClient.get('/api/auth/connections', authHeader ? { Authorization: authHeader } : {})
    return NextResponse.json(resp)
  } catch (error) {
    return NextResponse.json({ success: true, data: [] })
  }
}