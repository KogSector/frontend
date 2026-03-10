export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { dataApiClient, authClient, unwrapResponse } from '@/lib/api'

type ApiResp = { success?: boolean; error?: string; data?: unknown }

function isApiResp(obj: unknown): obj is ApiResp {
  return typeof obj === 'object' && obj !== null
}

function getData<T = unknown>(resp: unknown): T | undefined {
  if (isApiResp(resp) && 'data' in resp) {
    return resp.data as T
  }
  return undefined
}

function succeeded(resp: unknown): boolean {
  if (isApiResp(resp) && typeof resp.success === 'boolean') return resp.success
  return false
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { repoUrl?: unknown, credentials?: unknown }
    const repoUrl = typeof body.repoUrl === 'string' ? body.repoUrl : ''
    const credentials = typeof body.credentials === 'object' && body.credentials !== null ? body.credentials as Record<string, string> : null

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required.' }, { status: 400 })
    }

    const authHeader = request.headers.get('Authorization') || ''

    let provider = 'github'
    if (repoUrl.includes('gitlab.com')) provider = 'gitlab'
    if (repoUrl.includes('bitbucket.org')) provider = 'bitbucket'

    try {
      const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {}
      const resp = await authClient.get('/api/auth/connections', headers)
      const list = unwrapResponse<Array<{ platform: string; is_active: boolean }>>(resp) || []
      const hasRequired = list.some(c => c.is_active && c.platform === provider)
      if (!hasRequired) {
        return NextResponse.json({ error: `Please connect ${provider} in Social Connections first.` }, { status: 403 })
      }

      // If no credentials supplied, fetch OAuth token from auth-middleware
      if (!credentials || Object.keys(credentials).length === 0) {
        const tokenResp = await authClient.get(`/api/auth/connections/${provider}/token`, headers)
        const tokenData = unwrapResponse<{ access_token: string }>(tokenResp)
        if (tokenData && tokenData.access_token) {
          body.credentials = { access_token: tokenData.access_token }
        }
      }
    } catch (e) {
      console.error('Failed to get connection token:', e)
      return NextResponse.json({ error: 'Authentication required or backend unavailable' }, { status: 401 })
    }

    const branchesData = await dataApiClient.post('/api/repositories/fetch-branches', { repoUrl, credentials: body.credentials })
    if (!succeeded(branchesData)) {
      const err = isApiResp(branchesData) ? branchesData.error : undefined
      return NextResponse.json({ error: err || 'Failed to fetch branches' }, { status: 502 })
    }

    const branches = getData<{ branches?: unknown[]; default_branch?: string; file_extensions?: string[] }>(branchesData)

    return NextResponse.json({
      branches: branches?.branches,
      defaultBranch: branches?.default_branch,
      file_extensions: branches?.file_extensions,
      provider: undefined,
      repoInfo: undefined,
    })
  } catch (error) {
    console.error('Failed to fetch remote branches:', error)
    const message = (error && typeof error === 'object' && typeof (error as Record<string, unknown>)['message'] === 'string') ? (error as Record<string, unknown>)['message'] as string : 'An unknown error occurred while fetching branches.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
