'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth'
import { useAuth0 as useAuth0React } from '@auth0/auth0-react'

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // The consolidated context (handles backend sync & final redirect)
  const { isAuthenticated, isLoading: contextLoading, handleAuth0Callback } = useAuth()

  // The underlying @auth0/auth0-react hook (handles URL params)
  const { error: auth0Error, isLoading: sdkLoading } = useAuth0React()

  useEffect(() => {
    if (auth0Error) {
      console.error('❌ Auth0 login error:', auth0Error)
      setError(auth0Error.message)
      return
    }

    // Context will handle the redirect once fully authenticated and synced.
    // If we land here and aren't loading, but also aren't authenticated, the user probably went directly to the callback URL.
    if (!sdkLoading && !contextLoading && !isAuthenticated && !error) {
      console.log('⚠️ Not authenticated on callback page, redirecting to login...')
      router.push('/auth/login')
    }
  }, [isAuthenticated, contextLoading, sdkLoading, auth0Error, error, router])

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-muted-foreground">Completing login...</p>
    </div>
  )
}
