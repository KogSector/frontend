'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth0 } from '@/contexts/auth0-context'

export default function AuthCallbackPage() {
  const params = useSearchParams()
  const router = useRouter()
  const { handleAuth0Callback } = useAuth0()
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const code = params.get('code')
    const state = params.get('state')
    const errorParam = params.get('error')
    const errorDescription = params.get('error_description')

    // Check for errors in URL
    if (errorParam) {
      console.error('Auth callback error:', errorParam, errorDescription)
      setError(errorDescription || errorParam)
      setProcessing(false)
      return
    }

    // Handle Auth0 authorization code
    if (code && state) {
      // Verify state matches
      const storedState = localStorage.getItem('auth0_state')
      if (state !== storedState) {
        setError('Invalid state parameter - possible CSRF attack')
        setProcessing(false)
        return
      }

      // Exchange code for token and handle callback
      const exchangeCode = async () => {
        try {
          const tokenResponse = await fetch(`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/oauth/token`, {
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

          if (!tokenResponse.ok) {
            throw new Error('Token exchange failed')
          }

          const tokenData = await tokenResponse.json()
          const accessToken = tokenData.access_token

          // Clean up stored values
          localStorage.removeItem('auth0_state')
          localStorage.removeItem('auth0_code_verifier')

          // Handle the callback with the access token
          await handleAuth0Callback(accessToken)
          setProcessing(false)
          setSuccess(true)
          
          // Auto redirect to dashboard like normal apps
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500) // Show success message briefly
          
        } catch (e: any) {
          console.error('Auth0 token exchange error:', e)
          setError(e?.message || 'Authentication failed')
          setProcessing(false)
        }
      }

      exchangeCode()
    } else {
      setError('Missing authorization code or state')
      setProcessing(false)
    }
  }, [params, handleAuth0Callback])

  // Show loading while processing
  if (processing && !error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Completing authentication...</p>
        </div>
      </div>
    )
  }

  // Show success message briefly before redirect
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Authentication Successful
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Redirecting to dashboard...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    )
  }

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
