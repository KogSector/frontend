import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authClient, ApiResponse } from '@/lib/api'
import { useAuth0 as useAuth0React } from '@auth0/auth0-react'

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
  loginWithRedirect: (provider?: string) => Promise<void>
  loginWithPopup: (options?: any) => Promise<void>
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
  const [isSyncing, setIsSyncing] = useState(true)
  const router = useRouter()

  const {
    loginWithRedirect: auth0LoginWithRedirect,
    loginWithPopup: auth0LoginWithPopup,
    logout: auth0Logout,
    isLoading: auth0IsLoading,
    isAuthenticated: auth0IsAuthenticated,
    getAccessTokenSilently
  } = useAuth0React()

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
    localStorage.setItem('confuse_auth_token', authToken)

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
    localStorage.removeItem('confuse_auth_token')
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
      const result = await authClient.get<ApiResponse<User>>(
        '/api/auth/me',
        { Authorization: `Bearer ${authToken}` }
      )
      if (result?.success && result.data) {
        setUser(result.data as any)
      } else if ((result as any)?.user) {
        setUser((result as any).user)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      clearSession()
    }
  }, [clearSession])

  // Handle Auth0 callback (sync user and store Auth0 token)
  const handleAuth0Callback = useCallback(async (auth0AccessToken: string) => {
    try {
      console.log('handleAuth0Callback called with token:', auth0AccessToken?.substring(0, 20) + '...')
      setIsSyncing(true)

      // Call ConFuse auth service to sync user
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

      saveSession(auth0AccessToken, data.user)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Auth0 callback error:', error)
      clearSession()
      const errorMessage = error?.message || String(error)
      router.push(`/?error=auth_failed&detail=${encodeURIComponent(errorMessage)}`)
    } finally {
      setIsSyncing(false)
    }
  }, [saveSession, clearSession, router])

  // React to Auth0 SDK state changes and sync our internal session
  useEffect(() => {
    if (auth0IsLoading) {
      return;
    }

    // Auth0 says user is authenticated
    if (auth0IsAuthenticated) {
      const session = getSession();
      if (session && isSessionValid(session)) {
        // We already have a valid internal session
        setToken(session.token);
        if (!user) {
          fetchUserProfile(session.token).finally(() => setIsSyncing(false));
        } else {
          setIsSyncing(false);
        }
      } else {
        // We need to fetch the token and sync the profile with backend via handleAuth0Callback
        getAccessTokenSilently()
          .then(async (authToken) => {
            await handleAuth0Callback(authToken);
          })
          .catch((err) => {
            console.error('Failed to get token silently to restore session', err);
            clearSession();
            setIsSyncing(false);
          });
      }
    } else {
      // Auth0 says user is NOT authenticated
      clearSession();
      setIsSyncing(false);
    }
  }, [auth0IsLoading, auth0IsAuthenticated, getSession, isSessionValid, fetchUserProfile, clearSession, getAccessTokenSilently, user, handleAuth0Callback]);

  // Login using Auth0 React SDK
  const loginWithRedirect = useCallback(async (provider?: string) => {
    console.log('🔐 loginWithRedirect called with provider:', provider)

    await auth0LoginWithRedirect({
      authorizationParams: provider ? { connection: provider } : undefined
    });
  }, [auth0LoginWithRedirect])

  // Logout via Auth0 SDK
  const logout = useCallback(() => {
    clearSession()

    auth0Logout({
      logoutParams: { returnTo: auth0LogoutRedirectUri }
    });
  }, [auth0Logout, auth0LogoutRedirectUri, clearSession])

  const value: Auth0ContextType = {
    user,
    isAuthenticated: auth0IsAuthenticated && !!user && !!token,
    isLoading: auth0IsLoading || isSyncing,
    loginWithRedirect,
    loginWithPopup: auth0LoginWithPopup,
    logout,
    token,
    refreshToken: null,
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
