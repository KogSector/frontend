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
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
    return {};
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

/** Feature toggle service */
export const featureToggleClient = new ApiClient(SERVICE_URLS.featureToggle, 'feature-toggle');

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
  return dataClient.post('/api/urls', data);
}
export async function getUrls(): Promise<ApiResponse> {
  return dataClient.get('/api/urls');
}
export async function deleteUrl(id: string): Promise<ApiResponse> {
  return dataClient.delete(`/api/urls/${id}`);
}

// -- Documents --
export async function createDocument(data: { name: string; source: string; doc_type: string; size?: string; tags?: string[] }): Promise<ApiResponse<DocumentRecord>> {
  return dataClient.post('/api/documents', data);
}
export async function getDocuments(search?: string): Promise<ApiResponse<{ data: DocumentRecord[], total: number }>> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return dataClient.get(`/api/documents${params}`);
}
export async function deleteDocument(id: string): Promise<ApiResponse> {
  return dataClient.delete(`/api/documents/${id}`);
}
export async function getDocumentAnalytics(): Promise<ApiResponse> {
  return dataClient.get('/api/documents/analytics');
}

// -- Agents --
export async function getAgents(): Promise<ApiResponse<AgentRecord[]>> {
  return dataClient.get('/api/agents');
}
export async function getAgent(id: string): Promise<ApiResponse<AgentRecord>> {
  return dataClient.get(`/api/agents/${id}`);
}
export async function createAgent(data: CreateAgentRequest): Promise<ApiResponse<AgentRecord>> {
  return dataClient.post('/api/agents', data);
}
export async function updateAgent(id: string, data: UpdateAgentRequest): Promise<ApiResponse<AgentRecord>> {
  return dataClient.put(`/api/agents/${id}`, data);
}
export async function deleteAgent(id: string): Promise<ApiResponse> {
  return dataClient.delete(`/api/agents/${id}`);
}
export async function getAgentContext(id: string): Promise<ApiResponse> {
  return dataClient.get(`/api/agents/${id}/context`);
}
export async function invokeAgent(id: string, data: AgentInvokeRequest): Promise<ApiResponse<AgentInvokeResponse>> {
  return dataClient.post(`/api/agents/${id}/invoke`, data);
}
export async function testAgent(id: string): Promise<ApiResponse<{ connected: boolean }>> {
  return dataClient.post(`/api/agents/${id}/test`, {});
}

// -- Dashboard --
export async function getDashboardStats(): Promise<ApiResponse> {
  // This now calls frontend API route, not microservice
  const token = typeof window !== 'undefined' ? localStorage.getItem('confuse_auth_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/dashboard/stats', { headers });
  return response.json();
}

export async function getSystemHealth(): Promise<ApiResponse> {
  // This now calls frontend API route, not microservice
  const response = await fetch('/api/dashboard/health', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

// -- Landing Page --
export async function getLandingStats(): Promise<ApiResponse> {
  const response = await fetch('/api/landing/stats', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export async function getLandingFeatures(): Promise<ApiResponse> {
  const response = await fetch('/api/landing/features', {
    headers: {
      'Content-Type': 'application/json',
    },
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

/**
 * @deprecated Use dataClient directly. Kept for backward compat.
 */
export const dataApiClient = dataClient;
