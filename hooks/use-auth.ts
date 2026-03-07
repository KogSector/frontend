'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@/contexts/auth0-context'
import { apiClient, unwrapResponse } from '@/lib/api'

interface SocialConnection {
  id: string
  platform: string
  username: string
  is_active: boolean
  connected_at: string
  last_sync: string | null
}

export const useAuth = () => {
  const authContext = useAuth0()

  const [connections, setConnections] = useState<SocialConnection[]>([])

  // Fetch connections when we have a token
  const fetchConnections = useCallback(async () => {
    if (!authContext.token) return
    try {
      const headers = { Authorization: `Bearer ${authContext.token}` }
      const resp = await apiClient.get('/api/auth/connections', headers)
      const data = unwrapResponse<SocialConnection[]>(resp) ?? []
      setConnections(data)
    } catch (err) {
      console.error('Failed to fetch connections:', err)
    }
  }, [authContext.token])

  useEffect(() => {
    if (authContext.token) {
      fetchConnections()
    } else {
      setConnections([])
    }
  }, [authContext.token, fetchConnections])

  return {
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    login: authContext.loginWithRedirect,
    loginWithRedirect: authContext.loginWithRedirect,
    loginWithPopup: async (options?: any) => {
      console.warn('loginWithPopup is not supported in this configuration, falling back to loginWithRedirect')
      await authContext.loginWithRedirect()
    },
    logout: authContext.logout,
    getAccessTokenSilently: async () => authContext.token,
    token: authContext.token,
    connections,
    refreshConnections: fetchConnections,
    isBypassMode: false,
    clearLogoutFlag: () => { },

    register: async (data: any) => {
      throw new Error('register is not implemented for Auth0-based auth yet')
    },
    updateProfile: async (data: any) => {
      throw new Error('updateProfile is not implemented for Auth0-based auth yet')
    },
    changePassword: async () => {
      throw new Error('changePassword is not implemented for Auth0-based auth yet')
    },
  }
}

