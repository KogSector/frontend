'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, ApiResponse } from '@/lib/api'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  organization?: string
  role: 'admin' | 'user' | 'moderator'
  subscription_tier: 'free' | 'personal' | 'team' | 'enterprise'
  is_verified: boolean
  created_at: string
  last_login_at?: string
}

export interface Auth0ContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithRedirect: (provider?: string) => void
  logout: () => void
  token: string | null
  refreshToken: string | null
  handleAuth0Callback: (auth0Token: string) => Promise<void>
}

// Simplified Session Data (Auth0-only)
interface SessionData {
  token: string
  expires_at: string
  last_activity: string
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined)

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2 hours

export function Auth0Provider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Auth0 configuration from env
  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
  const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
  const auth0Audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
  const auth0Issuer = process.env.NEXT_PUBLIC_AUTH0_ISSUER
  const auth0RedirectUri = process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const auth0LogoutRedirectUri = process.env.NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URI || 'http://localhost:3000/'

  // Save session to localStorage
  const saveSession = useCallback((authToken: string, userProfile: User) => {
    const sessionData: SessionData = {
      token: authToken,
      expires_at: new Date(Date.now() + SESSION_TIMEOUT).toISOString(),
      last_activity: new Date().toISOString()
    }
    localStorage.setItem('auth_session', JSON.stringify(sessionData))
    localStorage.setItem('auth_token', authToken)

    setToken(authToken)
    setUser(userProfile)
  }, [])

  // Get session from localStorage
  const getSession = useCallback((): SessionData | null => {
    try {
      const sessionStr = localStorage.getItem('auth_session')
      if (!sessionStr) return null
      return JSON.parse(sessionStr)
    } catch {
      return null
    }
  }, [])

  // Clear session
  const clearSession = useCallback(() => {
    localStorage.removeItem('auth_session')
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
  }, [])

  // Check if session is valid
  const isSessionValid = useCallback((session: SessionData): boolean => {
    const now = new Date().getTime()
    const lastActivity = new Date(session.last_activity).getTime()
    const expiresAt = new Date(session.expires_at).getTime()

    return now < expiresAt && (now - lastActivity) < SESSION_TIMEOUT
  }, [])

  // Fetch user profile
  const fetchUserProfile = useCallback(async (authToken: string) => {
    try {
      const result = await apiClient.get<ApiResponse<User>>(
        '/api/auth/me',
        { Authorization: `Bearer ${authToken}` }
      )
      if (result?.success && result.data) { // Check for success wrapper
        setUser(result.data as any) // Type assertion might be needed if User types mismatch slightly
      } else if ((result as any)?.user) { // Handle unwrapped response if any
        setUser((result as any).user)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      clearSession()
    }
  }, [clearSession])


  // Initialize session on mount
  useEffect(() => {
    const session = getSession()
    if (session && isSessionValid(session)) {
      setToken(session.token)
      fetchUserProfile(session.token).finally(() => setIsLoading(false))
    } else {
      clearSession()
      setIsLoading(false)
    }
  }, [getSession, isSessionValid, fetchUserProfile, clearSession])

  // Login with Auth0 redirect
  const loginWithRedirect = useCallback(async (provider?: string) => {
    console.log('🔐 loginWithRedirect called with provider:', provider)

    if (!auth0Domain || !auth0ClientId || !auth0Audience) {
      console.error('❌ Auth0 configuration missing:', { auth0Domain, auth0ClientId, auth0Audience })
      return
    }

    console.log('🔧 Auth0 config:', {
      domain: auth0Domain,
      clientId: auth0ClientId?.substring(0, 10) + '...',
      audience: auth0Audience,
      redirectUri: auth0RedirectUri
    })

    // Generate and store state for CSRF protection
    const state = generateState()
    console.log('🎲 Generated state:', state)
    localStorage.setItem('auth0_state', state)

    // Generate code verifier and challenge for PKCE
    const codeVerifier = generateCodeVerifier()
    console.log('🔐 Generated code verifier:', codeVerifier.substring(0, 10) + '...')
    localStorage.setItem('auth0_code_verifier', codeVerifier)

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: auth0ClientId,
        redirect_uri: auth0RedirectUri,
        scope: 'openid profile email',
        audience: auth0Audience,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      })

      // Pass connection parameter to go directly to the provider
      if (provider) {
        params.append('connection', provider)
      }

      const authUrl = `https://${auth0Domain}/authorize?${params.toString()}`
      console.log('🌐 Redirecting to Auth0 URL:', authUrl)

      window.location.href = authUrl
    })
  }, [auth0Domain, auth0ClientId, auth0Audience, auth0RedirectUri])

  // Handle Auth0 callback (sync user and store Auth0 token)
  const handleAuth0Callback = useCallback(async (auth0AccessToken: string) => {
    try {
      console.log('handleAuth0Callback called with token:', auth0AccessToken?.substring(0, 20) + '...')
      setIsLoading(true)

      // Call ConFuse auth service to sync user (no exchange, just sync)
      const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3010'
      console.log('Calling auth service at:', authServiceUrl)

      const response = await fetch(`${authServiceUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth0AccessToken}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Auth service response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('Auth service error:', error)
        throw new Error(error.message || 'Auth0 login sync failed')
      }

      const data = await response.json()
      console.log('Auth service response data:', data)
      // Expecting { user: UserProfile } 

      saveSession(auth0AccessToken, data.user)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Auth0 callback error:', error)
      clearSession()
      router.push('/?error=auth_failed')
    } finally {
      setIsLoading(false)
    }
  }, [saveSession, clearSession, router])

  // Logout
  const logout = useCallback(() => {
    clearSession()

    if (auth0Domain && auth0ClientId) {
      // Redirect to Auth0 logout
      const params = new URLSearchParams({
        client_id: auth0ClientId,
        returnTo: auth0LogoutRedirectUri
      })
      window.location.href = `https://${auth0Domain}/v2/logout?${params.toString()}`
    } else {
      router.push('/')
    }
  }, [auth0Domain, auth0ClientId, auth0LogoutRedirectUri, clearSession, router])

  const value: Auth0ContextType = {
    user,
    isAuthenticated: !!user && !!token,
    isLoading,
    loginWithRedirect,
    logout,
    token,
    refreshToken: null, // No longer using refresh tokens on frontend
    handleAuth0Callback
  }

  return <Auth0Context.Provider value={value}>{children}</Auth0Context.Provider>
}

export function useAuth0() {
  const context = useContext(Auth0Context)
  if (context === undefined) {
    throw new Error('useAuth0 must be used within an Auth0Provider')
  }
  return context
}

// PKCE helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(hash))
}

function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

function base64UrlEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array))
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
