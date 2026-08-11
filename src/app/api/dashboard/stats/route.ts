export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { authClient, logUniProcClient, repoDataClient, docDataClient } from '@/lib/api'

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
}

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const userIdHeader = request.headers.get('x-user-id') || 'default_user'
    const headers: Record<string, string> = {
      'x-user-id': userIdHeader,
    }
    if (authHeader) headers['Authorization'] = authHeader

    // Helper function for timeout
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> => {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => resolve(null), timeoutMs);
      });
      return Promise.race([
        promise.then(res => {
          clearTimeout(timeoutId);
          return res;
        }),
        timeoutPromise
      ]);
    };

    // Fetch live data from services in parallel
    const [usersResponse, logsResponse, reposResponse, docsResponse, urlsResponse] = await Promise.allSettled([
      withTimeout(authClient.get('/api/users/stats', headers), 1500),
      withTimeout(logUniProcClient.get('/api/v1/stats', headers), 1500),
      withTimeout(repoDataClient.get('/api/repositories', headers), 1500),
      withTimeout(docDataClient.get('/api/documents', headers), 1500),
      withTimeout(docDataClient.get('/api/v1/external/urls', headers), 1500),
    ]);

    // Process repositories response
    let reposData: any[] = [];
    if (reposResponse.status === 'fulfilled' && reposResponse.value) {
      const val = reposResponse.value as any;
      if (Array.isArray(val?.repositories)) reposData = val.repositories;
      else if (Array.isArray(val?.data?.repositories)) reposData = val.data.repositories;
      else if (Array.isArray(val?.data)) reposData = val.data;
    }

    // Process documents response
    let docs: any[] = [];
    if (docsResponse.status === 'fulfilled' && docsResponse.value) {
      const val = docsResponse.value as any;
      if (Array.isArray(val?.data?.data)) docs = val.data.data;
      else if (Array.isArray(val?.data)) docs = val.data;
      else if (Array.isArray(val?.documents)) docs = val.documents;
    }

    // Process URLs response
    let urls: any[] = [];
    if (urlsResponse.status === 'fulfilled' && urlsResponse.value) {
      const val = urlsResponse.value as any;
      if (Array.isArray(val?.data)) urls = val.data;
      else if (Array.isArray(val?.urls)) urls = val.urls;
    }

    const jobsData: any[] = [];
    const agents: any[] = [];

    const userStatsData = usersResponse.status === 'fulfilled' && usersResponse.value ?
      (usersResponse.value as any).data : {} as UserStats

    const logStats = logsResponse.status === 'fulfilled' && logsResponse.value ?
      (logsResponse.value as any) : { log_entries: 0 }

    console.log('Dashboard Stats Fetch Results:', {
      repos: reposData.length,
      docs: docs.length,
      urls: urls.length,
      agents: agents.length,
      jobs: jobsData.length,
      logs: logStats?.log_entries || 0,
      liveFetch: true,
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
      documents: Array.isArray(docs) ? docs.length : 0,
      urls: Array.isArray(urls) ? urls.length : 0,
      logs: logStats?.log_entries || 0,
      activity: activity,
      connections: calculateConnections(reposData, urls),
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
      logs: 0,
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

function calculateConnections(repos: any[], urls: any[]): number {
  // Calculate active connections based on repositories, URLs
  const repoConnections = Array.isArray(repos) ? repos.filter(r => 
    ['connected', 'cloned', 'active', 'syncing'].includes(r.status?.toLowerCase())
  ).length : 0
  
  const urlConnections = Array.isArray(urls) ? urls.filter(u => 
    ['active', 'syncing', 'connected'].includes(u.status?.toLowerCase())
  ).length : 0
  
  return repoConnections + urlConnections
}

