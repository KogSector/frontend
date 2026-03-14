import { NextRequest, NextResponse } from 'next/server'
import { dataApiClient, authClient, unwrapResponse } from '@/lib/api'


function extractRepositoryName(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)

    if (pathParts.length >= 2) {
      const owner = pathParts[pathParts.length - 2]
      const repo = pathParts[pathParts.length - 1].replace('.git', '')
      return `${owner}/${repo}`
    }
    return null
  } catch {
    return null
  }
}

type ApiResp = { success?: boolean; error?: string; data?: unknown }

function isApiResp(obj: unknown): obj is ApiResp {
  return typeof obj === 'object' && obj !== null
}

function succeeded(resp: unknown): boolean {
  if (!isApiResp(resp)) return false
  // dataApiClient throws on non-2xx status, so if we get here and it has an id, it succeeded
  return resp.success === true || (typeof resp.id === 'string' && resp.id.length > 0)
}

function getData<T = unknown>(resp: unknown): T | undefined {
  if (!isApiResp(resp)) return undefined
  if ('data' in resp) return resp.data as T
  if ('id' in resp) return resp as T
  return undefined
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>
    const type = typeof body.type === 'string' ? body.type : undefined
    const url = typeof body.url === 'string' ? body.url : undefined
    const credentials = body.credentials as Record<string, unknown> | undefined
    const config = body.config as Record<string, unknown> | undefined

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Data source type is required' },
        { status: 400 }
      )
    }

    if (!url && (type === 'github' || type === 'bitbucket' || type === 'gitlab')) {
      return NextResponse.json(
        { success: false, error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    if (type === 'github' && !(credentials && typeof credentials['accessToken'] === 'string')) {
      return NextResponse.json(
        { success: false, error: 'GitHub access token is required' },
        { status: 400 }
      )
    }

    if (type === 'bitbucket' && !(credentials && typeof credentials['username'] === 'string' && typeof credentials['appPassword'] === 'string')) {
      return NextResponse.json(
        { success: false, error: 'BitBucket username and app password are required' },
        { status: 400 }
      )
    }

    let processedConfig = config
    if ((type === 'github' || type === 'bitbucket' || type === 'gitlab') && url) {
      const repoName = extractRepositoryName(url)
      if (repoName) {
        processedConfig = {
          ...config,
          repositories: [repoName],
          url,
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid repository URL format' },
          { status: 400 }
        )
      }
    }

    // Enforce social connections for git providers
    if (type === 'github' || type === 'gitlab' || type === 'bitbucket') {
      const authHeader = request.headers.get('Authorization') || ''
      try {
        const headers: Record<string, string> = authHeader ? { Authorization: authHeader } : {}
        const resp = await authClient.get('/api/auth/connections', headers)
        const list = unwrapResponse<Array<{ platform: string; is_active: boolean }>>(resp) || []
        const connected = list.some(c => c.is_active && c.platform === type)
        if (!connected) {
          return NextResponse.json(
            { success: false, error: `Please connect ${type.charAt(0).toUpperCase() + type.slice(1)} in Social Connections first` },
            { status: 403 }
          )
        }
      } catch (e) {
        return NextResponse.json(
          { success: false, error: 'Authentication required or backend unavailable' },
          { status: 401 }
        )
      }
    }

    const repoName = (url && extractRepositoryName(url)) || (config && config['name'] as string) || (config && config['repository'] as string) || 'Unnamed Source'

    // Construct URI based on source type if url is missing
    let uri = url
    if (!uri && config) {
      if (type === 'github' && config['repository']) {
        uri = `https://github.com/${config['repository']}`
      } else if (type === 'gitlab' && config['repository']) {
        const baseUrl = (config['gitlab_url'] as string) || 'https://gitlab.com'
        const repoPath = (config['repository'] as string).replace(/^\//, '')
        uri = `${baseUrl.replace(/\/$/, '')}/${repoPath}`
      } else if (type === 'bitbucket' && config['repository']) {
        const workspace = config['workspace'] as string
        const repo = config['repository'] as string
        uri = workspace ? `https://bitbucket.org/${workspace}/${repo}` : `https://bitbucket.org/${repo}`
      }
    }

    // Construct payload matching backend SourceCreateRequest
    const payload = {
      type,
      name: repoName,
      uri: uri || `upload://${Date.now()}`, // Fallback for non-git sources
      credentials,
      metadata: processedConfig,
    }

    const resp = await dataApiClient.post('/api/v1/sources', payload)
    if (!succeeded(resp)) {
      const err = isApiResp(resp) ? resp.error : undefined
      return NextResponse.json({ success: false, error: err || 'Failed to connect data source' }, { status: 502 })
    }

    return NextResponse.json({ success: true, message: 'Repository connected successfully', data: getData(resp) })

  } catch (error) {
    console.error('Error connecting data source:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}