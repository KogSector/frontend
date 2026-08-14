export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const SVC = {
  auth:    process.env.AUTH_SERVICE_URL        || 'http://localhost:3010',
  repo:    process.env.REPO_DATA_CON_URL       || 'http://localhost:3031',
  doc:     process.env.DOC_DATA_CON_URL        || 'http://localhost:3030',
  logProc: process.env.LOG_UNI_PROC_URL        || 'http://localhost:8095',
};

async function safeFetch(url: string, headers: Record<string, string>, timeoutMs = 1500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal, cache: 'no-store' });
    clearTimeout(id);
    if (!res.ok) return null;
    return res.json();
  } catch {
    clearTimeout(id);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const userIdHeader = request.headers.get('x-user-id') || 'default_user'
    const headers: Record<string, string> = { 'x-user-id': userIdHeader }
    if (authHeader) headers['Authorization'] = authHeader

    // Fetch live data from services in parallel
    const [usersResponse, logsResponse, reposResponse, docsResponse, urlsResponse] = await Promise.all([
      safeFetch(`${SVC.auth}/api/users/stats`, headers),
      safeFetch(`${SVC.logProc}/api/v1/stats`, headers),
      safeFetch(`${SVC.repo}/api/repositories`, headers),
      safeFetch(`${SVC.doc}/api/documents`, headers),
      safeFetch(`${SVC.doc}/api/v1/external/urls`, headers),
    ]);

    // Process repositories response
    let reposData: any[] = [];
    if (reposResponse) {
      const val = reposResponse as any;
      if (Array.isArray(val?.repositories)) reposData = val.repositories;
      else if (Array.isArray(val?.data?.repositories)) reposData = val.data.repositories;
      else if (Array.isArray(val?.data)) reposData = val.data;
    }

    // Process documents response
    let docs: any[] = [];
    if (docsResponse) {
      const val = docsResponse as any;
      if (Array.isArray(val?.data?.data)) docs = val.data.data;
      else if (Array.isArray(val?.data)) docs = val.data;
      else if (Array.isArray(val?.documents)) docs = val.documents;
    }

    // Process URLs response
    let urls: any[] = [];
    if (urlsResponse) {
      const val = urlsResponse as any;
      if (Array.isArray(val?.data)) urls = val.data;
      else if (Array.isArray(val?.urls)) urls = val.urls;
    }

    const userStatsData = (usersResponse as any)?.data || {};
    const logStats = (logsResponse as any) || { log_entries: 0 };

    const activity: any[] = [];

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

