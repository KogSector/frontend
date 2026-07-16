/**
 * ConFuse Frontend — API Configuration
 *
 * Post api-backend elimination: service-specific URLs.
 * Each microservice is accessed directly by the frontend.
 */

export const SERVICE_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_URL as string,
  docDataCon: process.env.NEXT_PUBLIC_DOC_DATA_CON_URL as string,
  repoDataCon: process.env.NEXT_PUBLIC_REPO_DATA_CON_URL as string,

  clientConnector: process.env.NEXT_PUBLIC_CLIENT_CONNECTOR_URL as string,
} as const;

/**
 * @deprecated Use SERVICE_URLS instead. Kept for backward compatibility
 * during migration. Maps to data-connector as the default service.
 */
export const API_CONFIG = {
  baseUrl: SERVICE_URLS.docDataCon,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT as string, 10) || 10000,
  retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES as string, 10) || 3,
  retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY as string, 10) || 1000,
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
    if (!url) {
      console.error(`Missing ${name} service URL`);
    } else if (!isValidUrl(url)) {
      console.error(`Invalid ${name} service URL:`, url);
    }
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('ConFuse Service URLs:', SERVICE_URLS);
  }
}

export default API_CONFIG;
