/**
 * ConFuse Frontend — API Configuration
 *
 * Post api-backend elimination: service-specific URLs.
 * Each microservice is accessed directly by the frontend.
 */

export const SERVICE_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3010',
  dataConnector: process.env.NEXT_PUBLIC_DATA_CONNECTOR_URL || 'http://localhost:8081',
  unifiedProcessor: process.env.NEXT_PUBLIC_UNIFIED_PROCESSOR_URL || 'http://localhost:8090',
  relationGraph: process.env.NEXT_PUBLIC_RELATION_GRAPH_URL || 'http://localhost:3003',
  mcpServer: process.env.NEXT_PUBLIC_MCP_URL || 'http://localhost:3004',
  embeddingsService: process.env.NEXT_PUBLIC_EMBEDDINGS_SERVICE_URL || 'http://localhost:3001',
  featureToggle: process.env.NEXT_PUBLIC_FEATURE_TOGGLE_URL || 'http://localhost:3099',
} as const;

/**
 * @deprecated Use SERVICE_URLS instead. Kept for backward compatibility
 * during migration. Maps to data-connector as the default service.
 */
export const API_CONFIG = {
  baseUrl: SERVICE_URLS.dataConnector,
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
} as const;

export const ENDPOINTS = {
  health: '/health',
  urls: '/api/urls',
  documents: '/api/documents',
  settings: '/api/settings',
} as const;


if (typeof window !== 'undefined') {
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate all service URLs
  Object.entries(SERVICE_URLS).forEach(([name, url]) => {
    if (!isValidUrl(url)) {
      console.error(`Invalid ${name} service URL:`, url);
    }
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('ConFuse Service URLs:', SERVICE_URLS);
  }
}

export default API_CONFIG;
