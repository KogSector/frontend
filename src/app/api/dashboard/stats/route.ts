export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { dataClient, authClient, clientConnectorClient } from '@/lib/api'

// Type definitions for API responses
interface APIResponse<T = any> {
  data?: T
  success?: boolean
  error?: string
}

interface UserStats {
  context_requests?: number
  security_score?: number
  total_users?: number
  active_users?: number
  api_calls?: number
  storage_used?: number
  bandwidth_used?: number
}

interface DashboardStats {
  repositories?: number
  documents?: number
  urls?: number
  agents?: number
}

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const userIdHeader = request.headers.get('x-user-id')
    const headers: Record<string, string> = {}
    if (authHeader) headers['Authorization'] = authHeader
    if (userIdHeader) headers['x-user-id'] = userIdHeader

    // Aggregate data from multiple services
    const [reposResponse, docsResponse, urlsResponse, usersResponse, jobsResponse] = await Promise.allSettled([
      dataClient.get('/api/repositories', headers),
      dataClient.get('/api/v1/documents', headers),
      dataClient.get('/api/v1/external/urls', headers),
      authClient.get('/api/users/stats', headers),
      dataClient.get('/api/v1/jobs?limit=5', headers)
    ])

    // Extract data safely with proper typing
    const reposData = reposResponse.status === 'fulfilled' && reposResponse.value ?
      (reposResponse.value as any).data?.repositories || (reposResponse.value as any).repositories || [] : []
    
    const docs = docsResponse.status === 'fulfilled' && docsResponse.value ?
      (docsResponse.value as any).data?.data || (docsResponse.value as any).data || [] : []
    
    const urls = urlsResponse.status === 'fulfilled' && urlsResponse.value ?
      (urlsResponse.value as any).data || [] : []
    
    const agents = [];
    
    const userStatsData = usersResponse.status === 'fulfilled' && usersResponse.value ?
      (usersResponse.value as any).data : {} as UserStats

    const jobsData = jobsResponse.status === 'fulfilled' && jobsResponse.value ?
      (jobsResponse.value as any).jobs || (jobsResponse.value as any).data?.jobs || [] : []

    console.log('Dashboard Stats Fetch Results:', {
      repos: Array.isArray(reposData) ? reposData.length : 'error',
      docs: Array.isArray(docs) ? docs.length : (docs.total || 0),
      urls: Array.isArray(urls) ? urls.length : 0,
      agents: Array.isArray(agents) ? agents.length : 0,
      jobs: Array.isArray(jobsData) ? jobsData.length : 0,
      reposStatus: reposResponse.status,
      docsStatus: docsResponse.status,
      urlsStatus: urlsResponse.status,
      jobsStatus: jobsResponse.status
    });

    // Map jobs to activity items
    const activity = jobsData.map((job: any) => {
      const time = new Date(job.created_at).toLocaleDateString(undefined, { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
      
      let action = "Processed source";
      if (job.status === 'completed') action = "Completed sync";
      if (job.status === 'failed') action = "Sync failed";
      if (job.status === 'syncing') action = "Syncing data";

      return {
        id: job.id,
        action: action,
        source: job.source_type === 'github' ? 'Repository' : (job.source_type === 'url' ? 'URL' : 'Document'),
        time: time,
        type: job.source_type || 'processing',
        status: job.status,
        timestamp: job.created_at,
        icon: job.source_type === 'github' ? 'Github' : 'FileText'
      };
    });

    // Calculate dashboard stats
    const stats = {
      repositories: Array.isArray(reposData) ? reposData.length : 0,
      documents: Array.isArray(docs) ? docs.length : (docs.total || 0),
      urls: Array.isArray(urls) ? urls.length : 0,
      agents: Array.isArray(agents) ? agents.length : 0,
      activity: activity,
      connections: calculateConnections(reposData, urls, agents),
      context_requests: userStatsData?.context_requests || 0,
      security_score: userStatsData?.security_score || 100,
      total_users: userStatsData?.total_users || 0,
      active_users: userStatsData?.active_users || 0,
      system_health: 100,
      usage_metrics: {
        api_calls: userStatsData?.api_calls || 0,
        storage_used: userStatsData?.storage_used || 0,
        bandwidth_used: userStatsData?.bandwidth_used || 0
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)

    // Return fallback data on error
    return NextResponse.json({
      repositories: 0,
      documents: 0,
      urls: 0,
      agents: 0,
      activity: [],
      connections: 0,
      context_requests: 0,
      security_score: 0,
      total_users: 0,
      active_users: 0,
      system_health: 0,
      usage_metrics: {
        api_calls: 0,
        storage_used: 0,
        bandwidth_used: 0
      }
    })
  }
}

function calculateConnections(repos: any[], urls: any[], agents: any[]): number {
  // Calculate active connections based on repositories, URLs, and agents
  const repoConnections = Array.isArray(repos) ? repos.filter(r => 
    ['connected', 'cloned', 'active', 'syncing'].includes(r.status?.toLowerCase())
  ).length : 0
  
  const urlConnections = Array.isArray(urls) ? urls.filter(u => 
    ['active', 'syncing', 'connected'].includes(u.status?.toLowerCase())
  ).length : 0
  
  const agentConnections = Array.isArray(agents) ? agents.filter(a => 
    ['connected', 'active'].includes(a.status?.toLowerCase())
  ).length : 0
  
  return repoConnections + urlConnections + agentConnections
}
