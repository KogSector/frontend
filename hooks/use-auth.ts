'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { apiClient, unwrapResponse } from '@/lib/api'

interface SocialConnection {
  id: string
  platform: string
  username: string
  is_active: boolean
  connected_at: string
  last_sync: string | null
}

interface BypassUser {
  id: string
  email: string
  name: string
  roles: string[]
}

export const useAuth = () => {
  const auth0 = useAuth0()

  // State for auth bypass mode
  const [bypassEnabled, setBypassEnabled] = useState(false)
  const [bypassUser, setBypassUser] = useState<BypassUser | null>(null)
  const [bypassLoading, setBypassLoading] = useState(true)

  // Token state - prefer ConFuse token from localStorage, fallback to Auth0 token
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [connections, setConnections] = useState<SocialConnection[]>([])

  // Check for auth bypass on mount
  useEffect(() => {
    const checkBypass = async () => {
      try {
        const response = await fetch('http://localhost:3099/api/toggles/authBypass', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(2000),
        });

        if (!response.ok) {
          setBypassEnabled(false)
          setBypassLoading(false)
          return
        }

        const data = await response.json()
        if (data.success && data.data?.enabled && data.data?.demoUser) {
          console.log('🔓 Auth bypass enabled - using demo user:', data.data.demoUser.email)
          setBypassEnabled(true)
          setBypassUser(data.data.demoUser)
          setAccessToken('bypass-demo-token')
        }
      } catch {
        // Feature toggle service not available - normal auth flow
        setBypassEnabled(false)
      } finally {
        setBypassLoading(false)
      }
    }

    checkBypass()
  }, [])

  // Check for ConFuse token in localStorage first, then fallback to Auth0 token
  useEffect(() => {
    // Skip if bypass is enabled
    if (bypassEnabled) return

    // First, check if we have a ConFuse token in localStorage (from auth0/exchange)
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

    if (storedToken) {
      // Verify the stored token is still valid by checking expiry
      try {
        const sessionStr = localStorage.getItem('auth_session')
        if (sessionStr) {
          const session = JSON.parse(sessionStr)
          const expiresAt = new Date(session.expires_at).getTime()
          const now = Date.now()

          if (now < expiresAt) {
            // Token is still valid, use it
            if (accessToken !== storedToken) {
              setAccessToken(storedToken)
            }
            return
          } else {
            // Token expired, clear it
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_session')
            localStorage.removeItem('refresh_token')
          }
        }
      } catch (e) {
        console.error('Error parsing stored session:', e)
      }
    }

    // Fallback to Auth0 access token if no valid ConFuse token
    if (auth0.isAuthenticated && !auth0.isLoading && !accessToken && !tokenLoading) {
      setTokenLoading(true)
      auth0.getAccessTokenSilently()
        .then((token) => {
          setAccessToken(token)
        })
        .catch((err) => {
          console.error('Failed to get Auth0 access token:', err)
          setAccessToken(null)
        })
        .finally(() => {
          setTokenLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth0.isAuthenticated, auth0.isLoading, tokenLoading, bypassEnabled])

  const login = () => {
    return auth0.loginWithRedirect()
  }

  const loginWithRedirect = () => {
    auth0.loginWithRedirect()
  }

  const logoutUser = () => {
    // Clear ConFuse tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_session')
      localStorage.removeItem('refresh_token')
    }
    setAccessToken(null)

    // If in bypass mode, just clear state and redirect - don't call Auth0
    if (bypassEnabled) {
      setBypassEnabled(false)
      setBypassUser(null)
      // Redirect to landing page
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      return
    }

    // Normal Auth0 logout
    setBypassEnabled(false)
    setBypassUser(null)
    auth0.logout({ logoutParams: { returnTo: window.location.origin } })
  }

  const getAccessTokenSilently = useCallback(async () => {
    // Return bypass token if enabled
    if (bypassEnabled) {
      return 'bypass-demo-token'
    }

    // Return cached token if available
    if (accessToken) {
      return accessToken
    }
    // Otherwise fetch fresh
    try {
      if (auth0.getAccessTokenSilently) {
        const token = await auth0.getAccessTokenSilently()
        setAccessToken(token)
        return token
      }
    } catch (err) {
      console.error('getAccessTokenSilently failed:', err)
    }
    return null
  }, [accessToken, auth0, bypassEnabled])

  // Clear token on logout
  useEffect(() => {
    if (!auth0.isAuthenticated && !bypassEnabled && accessToken) {
      setAccessToken(null)
      setConnections([])
    }
  }, [auth0.isAuthenticated, accessToken, bypassEnabled])

  // Fetch connections when we have a token
  const fetchConnections = useCallback(async () => {
    if (!accessToken) return
    try {
      const headers = { Authorization: `Bearer ${accessToken}` }
      const resp = await apiClient.get('/api/auth/connections', headers)
      const data = unwrapResponse<SocialConnection[]>(resp) ?? []
      setConnections(data)
    } catch (err) {
      console.error('Failed to fetch connections:', err)
    }
  }, [accessToken])

  useEffect(() => {
    if (accessToken && !bypassEnabled) {
      fetchConnections()
    }
  }, [accessToken, fetchConnections, bypassEnabled])

  // Create user object for bypass mode
  const user = bypassEnabled && bypassUser
    ? {
      sub: bypassUser.id,
      email: bypassUser.email,
      name: bypassUser.name,
      picture: undefined,
      roles: bypassUser.roles,
    }
    : auth0.user as any

  // Determine authentication state
  const isAuthenticated = bypassEnabled || auth0.isAuthenticated
  const isLoading = bypassLoading || auth0.isLoading

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithRedirect,
    logout: logoutUser,
    getAccessTokenSilently,
    // Auth0 access token (use this for API calls)
    token: accessToken,
    connections,
    refreshConnections: fetchConnections,
    // Bypass state for UI components
    isBypassMode: bypassEnabled,

    // Stubbed methods for now; callers may override these with real implementations
    // when backend Auth0-backed profile/password flows are wired up.
    register: async (_data: {
      email: string
      password: string
      name: string
      organization?: string
      avatar_url?: string
    }) => {
      throw new Error('register is not implemented for Auth0-based auth yet')
    },
    updateProfile: async (_data: {
      name?: string
      email?: string
      organization?: string
      avatar_url?: string
    }) => {
      throw new Error('updateProfile is not implemented for Auth0-based auth yet')
    },
    changePassword: async () => {
      throw new Error('changePassword is not implemented for Auth0-based auth yet')
    },
  }
}

