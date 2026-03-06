import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔄 API callback route called')
  console.log('📍 Request URL:', request.url)
  
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  console.log('🔍 API callback params:', { 
    code: code ? 'present' : 'missing', 
    state: state ? 'present' : 'missing', 
    error 
  })
  
  // Redirect to page callback with the same parameters
  const redirectUrl = new URL('/auth/callback', request.url)
  
  if (code) {
    redirectUrl.searchParams.set('code', code)
    console.log('✅ Forwarding code to page callback')
  }
  if (state) {
    redirectUrl.searchParams.set('state', state)
    console.log('✅ Forwarding state to page callback')
  }
  if (error) {
    redirectUrl.searchParams.set('error', error)
    console.log('❌ Forwarding error to page callback:', error)
  }
  
  console.log('➡️ Redirecting to:', redirectUrl.toString())
  return NextResponse.redirect(redirectUrl)
}

export async function POST(request: NextRequest) {
  console.log('📨 API callback POST called')
  return GET(request)
}
