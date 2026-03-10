import { NextRequest, NextResponse } from 'next/server'
import { authClient } from '@/lib/api'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization') || undefined
    const resp = await authClient.delete(`/api/auth/connections/${params.id}`, authHeader ? { Authorization: authHeader } : {})
    return NextResponse.json(resp)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization') || undefined
    const resp = await authClient.get(`/api/auth/connections`, authHeader ? { Authorization: authHeader } : {})
    return NextResponse.json(resp)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch connection' }, { status: 500 })
  }
}