export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { repoDataClient, authClient } from '@/lib/api'

// Type definitions for API responses
interface APIResponse<T = any> {
  data?: T
  success?: boolean
  error?: string
}

interface UserStats {
  total_documents?: number
  total_users?: number
  active_projects?: number
  api_calls_today?: number
  data_processed_gb?: number
}

export async function GET(request: NextRequest) {
  try {
    // Get public stats for landing page (no auth required)
    const [reposResponse, usersResponse] = await Promise.allSettled([
      repoDataClient.get('/api/repositories/public'),
      authClient.get('/api/users/public-stats')
    ])

    // Extract data safely with proper typing
    const repos = reposResponse.status === 'fulfilled' && reposResponse.value ? 
      (reposResponse.value as APIResponse<any[]>).data || [] : []
    const userStatsData = usersResponse.status === 'fulfilled' && usersResponse.value ? 
      (usersResponse.value as APIResponse<UserStats>).data : {} as UserStats

    // Calculate public stats
    const stats = {
      total_repositories: Array.isArray(repos) ? repos.length : 0,
      total_documents: userStatsData?.total_documents || 0,
      total_users: userStatsData?.total_users || 0,
      uptime_percentage: 99.9, // This could come from monitoring service
      active_projects: userStatsData?.active_projects || 0,
      api_calls_today: userStatsData?.api_calls_today || 0,
      data_processed: userStatsData?.data_processed_gb || 0,
      last_updated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching landing stats:', error)
    
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      data: {
        total_repositories: 0,
        total_documents: 0,
        total_users: 0,
        uptime_percentage: 0,
        active_projects: 0,
        api_calls_today: 0,
        data_processed: 0,
        last_updated: new Date().toISOString()
      }
    })
  }
}
