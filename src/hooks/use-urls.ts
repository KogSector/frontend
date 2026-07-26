export interface UrlRecord {
  id: string;
  url: string;
  title: string;
  description?: string;
  status: 'indexed' | 'indexing' | 'failed' | 'pending';
  last_indexed_at?: string;
  created_at: string;
  tags: string[];
}

export function useUrls() {
  return {
    urls: [] as UrlRecord[],
    loading: false,
    error: null,
    addUrl: async () => {},
    deleteUrl: async () => {},
    refreshUrls: async () => {},
  }
}
