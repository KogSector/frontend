import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get('provider') || 'github'
  const authServiceUrl = process.env.AUTH_SERVICE_URL || process.env.NEXT_PUBLIC_AUTH_SERVICE_URL
  
  try {
    // Forward the request to the auth backend service
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    const userIdHeader = req.headers.get('x-user-id')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    if (userIdHeader) {
      headers['x-user-id'] = userIdHeader
    }
    
    const response = await fetch(`${authServiceUrl}/api/auth/oauth/url?provider=${encodeURIComponent(provider)}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Auth service OAuth URL error:', errorText)
      return NextResponse.json(
        { error: `Failed to get OAuth URL: ${response.status}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('OAuth URL fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to auth service' },
      { status: 500 }
    )
  }
}