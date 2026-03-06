'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth0 } from '@/contexts/auth0-context'

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useSearchParams()
  const { handleAuth0Callback } = useAuth0()

  useEffect(() => {
    console.log('🔄 Auth callback page loaded')
    console.log('📍 Current URL:', window.location.href)
    
    const code = params.get('code')
    const state = params.get('state')
    const errorParam = params.get('error')
    const errorDescription = params.get('error_description')

    console.log('🔍 Auth callback params:', { 
      code: code ? 'present' : 'missing', 
      state: state ? 'present' : 'missing', 
      error: errorParam, 
      errorDescription 
    })

    // Check for errors in URL
    if (errorParam) {
      console.error('❌ Auth callback error:', errorParam, errorDescription)
      setError(errorDescription || errorParam)
      return
    }

    // Handle Auth0 authorization code
    if (code && state) {
      console.log('✅ Code and state present, proceeding with token exchange')
      
      // Verify state matches
      const storedState = localStorage.getItem('auth0_state')
      console.log('🔐 Stored state:', storedState, 'Received state:', state)
      
      if (state !== storedState) {
        console.error('❌ State mismatch - possible CSRF attack')
        setError('Invalid state parameter - possible CSRF attack')
        return
      }

      // Exchange code for token and handle callback
      const exchangeCode = async () => {
        try {
          console.log('🔄 Starting token exchange with code:', code?.substring(0, 10) + '...')
          
          const tokenUrl = `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/oauth/token`
          console.log('🌐 Token exchange URL:', tokenUrl)
          
          const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              grant_type: 'authorization_code',
              client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
              client_secret: process.env.AUTH0_CLIENT_SECRET,
              code: code,
              redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI,
              code_verifier: localStorage.getItem('auth0_code_verifier')
            }),
          })

          console.log('📊 Token exchange response status:', tokenResponse.status)
          
          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text()
            console.error('❌ Token exchange failed:', errorData)
            throw new Error('Token exchange failed')
          }

          const tokenData = await tokenResponse.json()
          console.log('✅ Token received:', Object.keys(tokenData))
          console.log('🔑 ID token present:', tokenData.id_token ? 'yes' : 'no')
          console.log('🔑 Access token present:', tokenData.access_token ? 'yes' : 'no')
          
          // Use ID token for verification, not access token
          const idToken = tokenData.id_token || tokenData.access_token
          console.log('🎯 Using token type:', tokenData.id_token ? 'ID token' : 'Access token')

          // Clean up stored values
          localStorage.removeItem('auth0_state')
          localStorage.removeItem('auth0_code_verifier')

          // Handle the callback with ID token
          console.log('🔄 Calling handleAuth0Callback...')
          await handleAuth0Callback(idToken)
          
          // Redirect immediately to dashboard - no loading screen
          console.log('➡️ Redirecting to dashboard...')
          router.push('/dashboard')
          
        } catch (e: any) {
          console.error('❌ Auth0 token exchange error:', e)
          setError(e?.message || 'Authentication failed')
        }
      }

      exchangeCode()
    } else {
      console.error('❌ Missing authorization code or state')
      setError('Missing authorization code or state')
    }
  }, [params, handleAuth0Callback])

  // Show error if any
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return null
}
