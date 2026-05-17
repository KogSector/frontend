import { NextRequest, NextResponse } from 'next/server'
import { authClient } from '@/lib/api'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || undefined
    const userIdHeader = request.headers.get('x-user-id') || undefined
    const headers: Record<string, string> = {}
    if (authHeader) headers['Authorization'] = authHeader
    if (userIdHeader) headers['x-user-id'] = userIdHeader
    
    const resp = await authClient.delete(`/api/auth/connections/${params.id}`, headers)
    return NextResponse.json(resp)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || undefined
    const userIdHeader = request.headers.get('x-user-id') || undefined
    const headers: Record<string, string> = {}
    if (authHeader) headers['Authorization'] = authHeader
    if (userIdHeader) headers['x-user-id'] = userIdHeader
    
    const resp = await authClient.get(`/api/auth/connections`, headers)
    return NextResponse.json(resp)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch connection' }, { status: 500 })
  }
}