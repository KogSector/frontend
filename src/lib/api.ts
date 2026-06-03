/**
 * ConFuse Frontend API Client
 *
 * Post api-backend elimination: uses service-specific clients.
 * Each client targets a different microservice directly.
 */
import { SERVICE_URLS, API_CONFIG } from './config';
import logger, { TRACE_ID_HEADER, SPAN_ID_HEADER, REQUEST_ID_HEADER } from './logger';

// =============================================================================
// Types
// =============================================================================

export interface DocumentRecord {
  id: string;
  user_id: string;
  name: string;
  doc_type: string;
  source: string;
  size: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  status: string;
}

export interface AgentRecord {
  id: string;
  user_id: string;
  name: string;
  provider?: string;
  agent_type: string;
  endpoint?: string;
  api_key: string;
  permissions: string[];
  status: 'Connected' | 'Pending' | 'Error' | 'Inactive';
  config: AgentConfig;
  created_at: string;
  updated_at: string;
  last_used?: string;
  usage_stats: AgentUsageStats;
}

export interface AgentConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  timeout?: number;
  custom_instructions?: string;
}

export interface AgentUsageStats {
  total_requests: number;
  total_tokens: number;
  avg_response_time?: number;
  last_error?: string;
}

export interface CreateAgentRequest {
  name: string;
  provider?: string;
  agent_type: string;
  endpoint?: string;
  api_key: string;
  permissions: string[];
  config: AgentConfig;
}

export interface UpdateAgentRequest {
  name?: string;
  endpoint?: string;
  api_key?: string;
  permissions?: string[];
  config?: AgentConfig;
  status?: AgentRecord['status'];
}

export interface AgentInvokeRequest {
  message: string;
  context_type?: string;
  include_history?: boolean;
}

export interface AgentInvokeResponse {
  response: string;
  usage: {
    tokens_used: number;
    response_time_ms: number;
  };
  context_used: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// =============================================================================
// ApiClient (core HTTP class)
// =============================================================================

export class ApiClient {
  patch<T>(arg0: string, arg1: { branch: string; }, tokenHeader: Record<string, string>) {
    throw new Error('Method not implemented.');
  }
  private baseUrl: string;
  private serviceName: string;

  constructor(baseUrl: string, serviceName = 'unknown') {
    this.baseUrl = baseUrl;
    this.serviceName = serviceName;

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      logger.debug('API Client initialized', { baseUrl: this.baseUrl, serviceName }, 'api');
    }
  }

  private getTraceHeaders(): Record<string, string> {
    return logger.getTraceHeaders();
  }

  /**
   * Get stored auth token for request injection.
   * Token is expected to be stored by the auth flow (e.g. Auth0 SDK).
   */
  private getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('confuse_auth_token');
    const userId = localStorage.getItem('confuse_user_id');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
      headers['x-user-id'] = userId;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Failed to parse response: ${response.statusText}`);
    }
    if (!response.ok) {
      const dataObj = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {};
      const errorMessage = typeof dataObj['detail'] === 'string'
        ? dataObj['detail']
        : (typeof dataObj['error'] === 'string' ? dataObj['error'] : (typeof dataObj['message'] === 'string' ? dataObj['message'] : `HTTP error! status: ${response.status}`));
      throw new Error(errorMessage);
    }
    return data as T;
  }

  async get<T = unknown>(endpoint: string, headers: Record<string, string> = {}): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...this.getTraceHeaders(),
          ...headers,
        },
      });
      const duration = performance.now() - startTime;
      logger.trackAPICall(`[${this.serviceName}] ${endpoint}`, 'GET', duration, response.status);
      return this.handleResponse<T>(response);
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.trackAPICall(`[${this.serviceName}] ${endpoint}`, 'GET', duration, 0, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async post<T = unknown>(endpoint: string, data: unknown, headers: Record<string, string> = {}): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...this.getTraceHeaders(),
          ...headers,
        },
        body: JSON.stringify(data),
      });
      const duration = performance.now() - startTime;
      logger.trackAPICall(`[${this.serviceName}] ${endpoint}`, 'POST', duration, response.status);
      return this.handleResponse<T>(response);
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.trackAPICall(`[${this.serviceName}] ${endpoint}`, 'POST', duration, 0, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async postForm<T = unknown>(endpoint: string, form: FormData, headers: Record<string, string> = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          ...headers,
        },
        body: form,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API POST FORM ${endpoint} failed:`, error);
      throw error;
    }
  }

  async put<T = unknown>(endpoint: string, data: unknown, headers: Record<string, string> = {}): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...this.getTraceHeaders(),
          ...headers,
        },
        body: JSON.stringify(data),
      });
      const duration = performance.now() - startTime;
      logger.trackAPICall(`[${this.serviceName}] ${endpoint}`, 'PUT', duration, response.status);
      return this.handleResponse<T>(response);
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.trackAPICall(`[${this.serviceName}] ${endpoint}`, 'PUT', duration, 0, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async delete<T = unknown>(endpoint: string, headers: Record<string, string> = {}): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...this.getTraceHeaders(),
          ...headers,
        },
      });
      const duration = performance.now() - startTime;
      logger.trackAPICall(`[${this.serviceName}] ${endpoint}`, 'DELETE', duration, response.status);
      return this.handleResponse<T>(response);
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.trackAPICall(`[${this.serviceName}] ${endpoint}`, 'DELETE', duration, 0, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async health(): Promise<ApiResponse> {
    return this.get('/health');
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.health() as unknown as { status?: string; success?: boolean };
      return response.status === 'healthy' || response.success === true;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// Service-Specific Client Instances
// =============================================================================

/** Auth middleware service (login, token validation, RBAC) */
export const authClient = new ApiClient(SERVICE_URLS.auth, 'auth');

/** Data connector service (sources, agents, documents, URLs, repos, dashboard) */
export const dataClient = new ApiClient(SERVICE_URLS.dataConnector, 'data-connector');

/** Unified processor service (document/code processing, embeddings) */
export const processorClient = new ApiClient(SERVICE_URLS.unifiedProcessor, 'unified-processor');

/** Relation graph service (search, relationships, entity evolution) */
export const graphClient = new ApiClient(SERVICE_URLS.relationGraph, 'relation-graph');
/** MCP server (Agent protocol) */
export const mcpClient = new ApiClient(SERVICE_URLS.mcpServer, 'mcp-server');

/** Embeddings service */
export const embeddingsClient = new ApiClient(SERVICE_URLS.embeddingsService, 'embeddings-service');


export const clientConnectorClient = new ApiClient(SERVICE_URLS.clientConnector, 'client-connector');

/**
 * @deprecated Use dataClient, graphClient, processorClient, etc. instead.
 * Kept for backward-compat during migration. Points to data-connector.
 */
export const apiClient = dataClient;

// =============================================================================
// Data Connector API (agents, documents, URLs, repos, dashboard, sources)
// =============================================================================

// -- URLs --
export async function createUrl(data: { url: string; title?: string; description?: string; tags?: string[] }): Promise<ApiResponse> {
  return dataClient.post('/api/v1/external/urls', data);
}
export async function getUrls(): Promise<ApiResponse> {
  return dataClient.get('/api/v1/external/urls');
}
export async function deleteUrl(id: string): Promise<ApiResponse> {
  return dataClient.delete(`/api/v1/external/urls/${id}`);
}
export async function updateUrl(id: string, data: { title?: string; description?: string; tags?: string[] }): Promise<ApiResponse> {
  return dataClient.put(`/api/v1/external/urls/${id}`, data);
}

// -- Documents --
export async function createDocument(data: { name: string; source: string; doc_type: string; size?: string; tags?: string[] }): Promise<ApiResponse<DocumentRecord>> {
  return dataClient.post('/api/v1/documents', data);
}
export async function getDocuments(search?: string): Promise<ApiResponse<{ data: DocumentRecord[], total: number }>> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return dataClient.get(`/api/v1/documents${params}`);
}
export async function deleteDocument(id: string): Promise<ApiResponse> {
  return dataClient.delete(`/api/v1/documents/${id}`);
}
export async function getDocumentAnalytics(): Promise<ApiResponse> {
  return dataClient.get('/api/v1/documents/analytics');
}

// -- Agents --
export async function getAgents(): Promise<ApiResponse<AgentRecord[]>> {
  return clientConnectorClient.get('/api/agents');
}
export async function getAgent(id: string): Promise<ApiResponse<AgentRecord>> {
  return clientConnectorClient.get(`/api/agents/${id}`);
}
export async function createAgent(data: CreateAgentRequest): Promise<ApiResponse<AgentRecord>> {
  return clientConnectorClient.post('/api/agents', data);
}
export async function updateAgent(id: string, data: UpdateAgentRequest): Promise<ApiResponse<AgentRecord>> {
  return clientConnectorClient.put(`/api/agents/${id}`, data);
}
export async function deleteAgent(id: string): Promise<ApiResponse> {
  return clientConnectorClient.delete(`/api/agents/${id}`);
}
export async function getAgentContext(id: string): Promise<ApiResponse> {
  return clientConnectorClient.get(`/api/agents/${id}/context`);
}
export async function invokeAgent(id: string, data: AgentInvokeRequest): Promise<ApiResponse<AgentInvokeResponse>> {
  return clientConnectorClient.post(`/api/agents/${id}/invoke`, data);
}
export async function testAgent(id: string): Promise<ApiResponse<{ connected: boolean }>> {
  return clientConnectorClient.post(`/api/agents/${id}/test`, {});
}

// -- Dashboard --
export async function getDashboardStats(): Promise<ApiResponse> {
  // This now calls frontend API route, not microservice
  const token = typeof window !== 'undefined' ? localStorage.getItem('confuse_auth_token') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('confuse_user_id') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch('/api/dashboard/stats', { headers, cache: 'no-store' });
  return response.json();
}

export async function getSystemHealth(): Promise<ApiResponse> {
  // This now calls frontend API route, not microservice
  const response = await fetch('/api/dashboard/health', {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  return response.json();
}

// -- Landing Page --
export async function getLandingStats(): Promise<ApiResponse> {
  const response = await fetch('/api/landing/stats', {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  return response.json();
}

export async function getLandingFeatures(): Promise<ApiResponse> {
  const response = await fetch('/api/landing/features', {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  return response.json();
}

// -- Sources --
export async function getSources(): Promise<ApiResponse> {
  return dataClient.get('/api/v1/sources');
}
export async function createSource(data: unknown): Promise<ApiResponse> {
  return dataClient.post('/api/v1/sources', data);
}
export async function deleteSource(id: string): Promise<ApiResponse> {
  return dataClient.delete(`/api/v1/sources/${id}`);
}
export async function syncSource(id: string): Promise<ApiResponse> {
  return dataClient.post(`/api/v1/sources/${id}/sync`, {});
}

// -- Repositories --
export async function getRepositories(): Promise<ApiResponse> {
  return dataClient.get('/api/repositories');
}
export async function createRepository(data: unknown): Promise<ApiResponse> {
  return dataClient.post('/api/repositories', data);
}
export async function deleteRepository(id: string): Promise<ApiResponse> {
  return dataClient.delete(`/api/repositories/${id}`);
}

// =============================================================================
// Relation Graph API (search)
// =============================================================================

export async function hybridSearch(query: string, options: Record<string, unknown> = {}): Promise<ApiResponse> {
  return graphClient.post('/api/v1/search', { query, ...options });
}
export async function vectorSearch(query: string, options: Record<string, unknown> = {}): Promise<ApiResponse> {
  return graphClient.post('/api/v1/temporal-search', { query, ...options });
}

// =============================================================================
// Auth API
// =============================================================================

export async function listAuthConnections(): Promise<ApiResponse> {
  return authClient.get('/api/auth/connections');
}

// =============================================================================
// Utility
// =============================================================================

export async function importDocumentFromProvider(data: {
  provider: string;
  file_id: string;
  name: string;
  mime_type?: string;
  size?: number;
}): Promise<ApiResponse> {
  return dataClient.post('/api/data/documents/import', data);
}



export function unwrapResponse<T = unknown>(resp: unknown): T | undefined {
  if (typeof resp === 'object' && resp !== null) {
    const r = resp as Record<string, unknown>;
    if ('data' in r) return r.data as T;
  }
  return resp as T | undefined;
}

// =============================================================================
// Feature Toggle API
// =============================================================================

export interface FeatureToggle {
  name: string;
  enabled: boolean;
  description: string;
  category: string;
  categoryType?: string;
}

export interface ToggleState {
  [key: string]: {
    enabled: boolean;
    description: string;
    category: string;
    categoryType?: string;
  };
}

export async function getAllToggles(): Promise<ApiResponse<ToggleState>> {
  const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/toggles`);
  return res.json();
}

export async function getToggle(name: string): Promise<ApiResponse<FeatureToggle>> {
  const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/toggles/${encodeURIComponent(name)}`);
  return res.json();
}

const toggleCache: {
  [key: string]: {
    enabled: boolean;
    timestamp: number;
  };
} = {};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function isToggleEnabled(name: string): Promise<boolean> {
  const now = Date.now();
  
  // 1. Check if we have a fresh cached value
  if (toggleCache[name] && (now - toggleCache[name].timestamp < CACHE_TTL_MS)) {
    return toggleCache[name].enabled;
  }

  try {
    const response = await getToggle(name);
    const enabled = response.data?.enabled || false;
    
    // 2. Update cache with fresh value
    toggleCache[name] = { enabled, timestamp: now };
    return enabled;
  } catch (error) {
    console.warn(`[isToggleEnabled] Database fetch failed for toggle "${name}". Falling back to stale cache.`, error);
    
    // 3. Fallback to expired cache if DB is down
    if (toggleCache[name]) {
      return toggleCache[name].enabled;
    }
    
    // 4. Default to disabled only if no cache exists
    return false;
  }
}

/**
 * @deprecated Use dataClient directly. Kept for backward compat.
 */
export const dataApiClient = dataClient;
