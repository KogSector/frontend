'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, authClient, ApiResponse, unwrapResponse } from '@/lib/api'
import { useAuth0 as useAuth0React } from '@auth0/auth0-react'

// ============================================================================
// TYPES
// ============================================================================

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

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  // Traditional auth methods
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  // Auth0 methods
  loginWithRedirect: (provider?: string) => Promise<void>
  loginWithPopup: (options?: any) => Promise<void>
  handleAuth0Callback: (auth0Token: string) => Promise<void>
  getAccessTokenSilently: () => Promise<string>
  // Common properties
  token: string | null
  refreshToken: string | null
  connections: Array<{ id: string; platform: string; username?: string; is_active: boolean }> | null
  refreshConnections: () => Promise<void>
}

export interface RegisterData {
  email: string
  password: string
  name: string
  avatar_url?: string
  organization?: string
}

interface AuthResponse {
  user: User
  token: string
  expires_at: string
}

interface SessionData {
  token: string
  expires_at: string
  last_activity: string
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2 hours

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(true)
  const [connections, setConnections] = useState<Array<{ id: string; platform: string; username?: string; is_active: boolean }> | null>(null)
  const router = useRouter()

  // Auth0 SDK integration
  const {
    loginWithRedirect: auth0LoginWithRedirect,
    loginWithPopup: auth0LoginWithPopup,
    logout: auth0Logout,
    isLoading: auth0IsLoading,
    isAuthenticated: auth0IsAuthenticated,
    getAccessTokenSilently
  } = useAuth0React()

  const auth0LogoutRedirectUri = process.env.NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URI || 'http://localhost:3000/'

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  const saveSession = useCallback((authToken: string, userProfile?: User) => {
    const sessionData: SessionData = {
      token: authToken,
      expires_at: new Date(Date.now() + SESSION_TIMEOUT).toISOString(),
      last_activity: new Date().toISOString()
    }
    localStorage.setItem('auth_session', JSON.stringify(sessionData))
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('confuse_auth_token', authToken)

    setToken(authToken)
    if (userProfile) {
      setUser(userProfile)
    }
  }, [])

  const getSession = useCallback((): SessionData | null => {
    try {
      const sessionStr = localStorage.getItem('auth_session')
      if (!sessionStr) return null
      return JSON.parse(sessionStr)
    } catch {
      return null
    }
  }, [])

  const updateLastActivity = useCallback(() => {
    const session = getSession()
    if (session) {
      session.last_activity = new Date().toISOString()
      localStorage.setItem('auth_session', JSON.stringify(session))
    }
  }, [])

  const isSessionValid = useCallback((session: SessionData): boolean => {
    const now = new Date().getTime()
    const lastActivity = new Date(session.last_activity).getTime()
    const expiresAt = new Date(session.expires_at).getTime()

    return now < expiresAt && (now - lastActivity) < SESSION_TIMEOUT
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem('auth_session')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('confuse_auth_token')
    setToken(null)
    setUser(null)
    setConnections(null)
  }, [])

  // ============================================================================
  // USER PROFILE MANAGEMENT
  // ============================================================================

  const fetchUserProfile = useCallback(async (authToken: string) => {
    try {
      const result = await apiClient.get<ApiResponse<User>>('/api/auth/profile', { Authorization: `Bearer ${authToken}` })
      if (result?.success && result.data) {
        setUser(result.data)
      } else {
        throw new Error('Failed to fetch user profile')
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      clearSession()
    }
  }, [clearSession])

  const refreshConnections = useCallback(async () => {
    if (!token) {
      setConnections(null)
      return
    }
    try {
      const resp = await apiClient.get<ApiResponse<Array<{ id: string; platform: string; username?: string; is_active: boolean }>>>('/api/auth/connections', { Authorization: `Bearer ${token}` })
      if (resp?.success) {
        setConnections(resp.data ?? [])
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err)
    }
  }, [token])

  // ============================================================================
  // TOKEN VERIFICATION
  // ============================================================================

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const authBase = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3010';
      const response = await fetch(`${authBase}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.valid) {
          await fetchUserProfile(tokenToVerify)
          await refreshConnections()
        } else {
          clearSession()
        }
      } else {
        clearSession()
      }
    } catch (err: unknown) {
      console.error('Token verification failed:', err)
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }, [fetchUserProfile, clearSession, refreshConnections])

  // ============================================================================
  // AUTH0 INTEGRATION
  // ============================================================================

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
      await refreshConnections()
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Auth0 callback error:', error)
      clearSession()
      const errorMessage = error?.message || String(error)
      router.push(`/?error=auth_failed&detail=${encodeURIComponent(errorMessage)}`)
    } finally {
      setIsSyncing(false)
    }
  }, [saveSession, clearSession, router, refreshConnections])

  // ============================================================================
  // AUTH BYPASS (DEVELOPMENT)
  // ============================================================================

  const checkAuthBypass = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3099/api/toggles/authBypass', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(500),  // Fast-fail: 500ms timeout
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.data?.enabled && data.data?.demoUser) {
        console.log('🔓 Auth bypass enabled - using demo user:', data.data.demoUser.email);
        const demoUser: User = {
          id: data.data.demoUser.id,
          email: data.data.demoUser.email,
          name: data.data.demoUser.name,
          role: 'admin',
          subscription_tier: 'enterprise',
          is_verified: true,
          created_at: new Date().toISOString(),
        };
        setUser(demoUser);
        setToken('bypass-demo-token');
        return true;
      }
      return false;
    } catch {
      // Feature toggle service not available - normal auth flow
      return false;
    }
  }, []);

  // ============================================================================
  // INITIALIZATION AND SESSION RESTORATION
  // ============================================================================

  useEffect(() => {
    const initAuth = async () => {
      // First, check if auth bypass is enabled (development only)
      const bypassEnabled = await checkAuthBypass();
      if (bypassEnabled) {
        setIsLoading(false);
        return;
      }

      // Check if Auth0 is authenticated
      if (auth0IsAuthenticated) {
        const session = getSession();
        if (session && isSessionValid(session)) {
          // We already have a valid internal session
          setToken(session.token);
          updateLastActivity();
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
        // Check for traditional auth session
        const session = getSession();
        if (session && isSessionValid(session)) {
          setToken(session.token);
          updateLastActivity();

          const timeoutId = setTimeout(() => {
            setIsLoading(false);
          }, 3000);

          verifyToken(session.token).finally(() => {
            clearTimeout(timeoutId);
          });
        } else {
          clearSession();
          setIsLoading(false);
        }
      }
    };

    initAuth();
  }, [
    auth0IsAuthenticated, 
    auth0IsLoading, 
    getSession, 
    isSessionValid, 
    fetchUserProfile, 
    clearSession, 
    getAccessTokenSilently, 
    user, 
    handleAuth0Callback, 
    verifyToken, 
    updateLastActivity, 
    checkAuthBypass
  ])

  // Update activity on user interaction
  useEffect(() => {
    if (token) {
      const handleActivity = () => updateLastActivity()

      window.addEventListener('mousedown', handleActivity)
      window.addEventListener('keydown', handleActivity)
      window.addEventListener('scroll', handleActivity)

      return () => {
        window.removeEventListener('mousedown', handleActivity)
        window.removeEventListener('keydown', handleActivity)
        window.removeEventListener('scroll', handleActivity)
      }
    }
  }, [token, updateLastActivity])

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await apiClient.post('/api/auth/login', { email, password })
      const data = unwrapResponse<AuthResponse>(result)

      if (data && data.user && data.token) {
        setUser(data.user)
        setToken(data.token)
        saveSession(data.token)
        await refreshConnections()
        router.push('/dashboard')
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const result = await apiClient.post('/api/auth/register', data)
      const authData = unwrapResponse<AuthResponse>(result)

      if (authData && authData.user && authData.token) {
        setUser(authData.user)
        setToken(authData.token)
        saveSession(authData.token)
        await refreshConnections()
        router.push('/dashboard')
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!token) throw new Error('No authentication token')

    try {
      const result = await apiClient.put<ApiResponse<User>>('/api/auth/profile', data, { Authorization: `Bearer ${token}` })

      if (result?.success && result.data) {
        setUser(result.data)
      } else {
        throw new Error(result?.error || 'Profile update failed')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) throw new Error('No authentication token')

    try {
      const result = await apiClient.post<ApiResponse>('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      }, { Authorization: `Bearer ${token}` })

      if (!result?.success) {
        throw new Error(result?.error || 'Password change failed')
      }
    } catch (error) {
      console.error('Password change error:', error)
      throw error
    }
  }

  const logout = useCallback(() => {
    clearSession()
    
    // If Auth0 is authenticated, logout via Auth0 SDK
    if (auth0IsAuthenticated) {
      auth0Logout({
        logoutParams: { returnTo: auth0LogoutRedirectUri }
      });
    } else {
      router.push('/')
    }
  }, [clearSession, auth0IsAuthenticated, auth0Logout, auth0LogoutRedirectUri, router])

  const loginWithRedirect = useCallback(async (provider?: string) => {
    console.log('🔐 loginWithRedirect called with provider:', provider)

    await auth0LoginWithRedirect({
      authorizationParams: provider ? { connection: provider } : undefined
    });
  }, [auth0LoginWithRedirect])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!token,
    isLoading: isLoading || isSyncing,
    // Traditional auth methods
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    // Auth0 methods
    loginWithRedirect,
    loginWithPopup: auth0LoginWithPopup,
    handleAuth0Callback,
    getAccessTokenSilently,
    // Common properties
    token,
    refreshToken: null,
    connections,
    refreshConnections,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Legacy export for backward compatibility
export function useAuth0() {
  return useAuth()
}
