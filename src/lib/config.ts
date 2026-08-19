/**
 * ConFuse Frontend — API Configuration
 *
 * Post api-backend elimination: service-specific URLs.
 * Each microservice is accessed directly by the frontend.
 */

const DEPLOYED_URL_PATTERNS = ['.confuse.site'];

const getLocalFallback = (value: string | undefined, fallback: string) => {
  // If the environment variable is set and valid, use it
  if (value && value.trim() !== '') {
    return value;
  }
  
  // Safely check window object for SSR / Node server environment
  const isBrowser = typeof window !== 'undefined';
  const isDeployedBrowser = isBrowser && DEPLOYED_URL_PATTERNS.some(pattern => window.location.origin.includes(pattern));

  // Only use fallback if we're not in a deployed environment
  if (!isDeployedBrowser) {
    return fallback;
  }
  
  // In deployed environment without env var, return empty string (will be caught by validation)
  return '';
};

export const SERVICE_URLS = {
  auth: getLocalFallback(process.env.NEXT_PUBLIC_AUTH_URL as string, 'http://127.0.0.1:3010'),
  docDataCon: getLocalFallback(process.env.NEXT_PUBLIC_DOC_DATA_CON_URL as string, 'http://127.0.0.1:3030'),
  repoDataCon: getLocalFallback(process.env.NEXT_PUBLIC_REPO_DATA_CON_URL as string, 'http://127.0.0.1:3031'),
  clientConnector: getLocalFallback(process.env.NEXT_PUBLIC_CLIENT_CONNECTOR_URL as string, 'http://127.0.0.1:8000'),
  featureToggle: getLocalFallback(process.env.NEXT_PUBLIC_FEATURE_TOGGLE_URL as string, 'http://127.0.0.1:3099'),
  logDataCon: getLocalFallback(process.env.NEXT_PUBLIC_LOG_DATA_CON_URL as string, 'http://127.0.0.1:3032'),
  logUniProc: getLocalFallback(process.env.NEXT_PUBLIC_LOG_UNI_PROC_URL as string, 'http://127.0.0.1:8095'),
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
    console.log('NEXT_PUBLIC_FEATURE_TOGGLE_URL:', process.env.NEXT_PUBLIC_FEATURE_TOGGLE_URL);
  }
}

export default API_CONFIG;
