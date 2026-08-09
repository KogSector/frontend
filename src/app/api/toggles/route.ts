import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = process.env.DATABASE_URL 
  ? new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }) 
  : null;

let cachedTogglePayload: { success: boolean; data: Record<string, any> } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 3000;

// Hardcoded default toggles for local dev when DB/microservice is unavailable
const DEFAULT_TOGGLES: Record<string, any> = {
  enableDeployedUrls: { enabled: false, description: 'Use deployed URLs instead of localhost', category: 'infrastructure', categoryType: 'system' },
  enableLogIngestion: { enabled: true, description: 'Enable cloud log ingestion pipeline', category: 'logging', categoryType: 'feature' },
  enableLogRetention: { enabled: true, description: 'Enable automatic log retention cleanup', category: 'logging', categoryType: 'feature' },
  enableDashboardStats: { enabled: true, description: 'Show dashboard statistics', category: 'ui', categoryType: 'feature' },
  enableDocumentUpload: { enabled: true, description: 'Allow document uploads', category: 'documents', categoryType: 'feature' },
  enableRepositorySync: { enabled: true, description: 'Allow repository syncing', category: 'repositories', categoryType: 'feature' },
  deployedTesting: { enabled: false, description: 'Deployed testing mode', category: 'testing', categoryType: 'system' },
};

function getCachedPayload() {
  if (cachedTogglePayload && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedTogglePayload;
  }
  return null;
}

function setCachedPayload(payload: { success: boolean; data: Record<string, any> }) {
  cachedTogglePayload = payload;
  cacheTimestamp = Date.now();
}

export async function GET() {
  const cached = getCachedPayload();
  if (cached) {
    return NextResponse.json(cached);
  }

  if (!pool) {
    // No DB configured — return hardcoded defaults (no error)
    const payload = { success: true, data: DEFAULT_TOGGLES };
    setCachedPayload(payload);
    return NextResponse.json(payload);
  }

  try {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT name, enabled, description, category, category_type as "categoryType", metadata FROM feature_toggles.toggles'
      );

      const toggles: Record<string, any> = {};
      for (const row of result.rows) {
        toggles[row.name] = {
          enabled: Boolean(row.enabled),
          description: row.description,
          category: row.category,
          categoryType: row.categoryType,
          metadata: row.metadata || {}
        };
      }

      const payload = {
        success: true,
        data: toggles,
      };
      setCachedPayload(payload);
      return NextResponse.json(payload);
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn(`[DB Fallback] DB unavailable, using hardcoded defaults`);
    const payload = { success: true, data: DEFAULT_TOGGLES };
    setCachedPayload(payload);
    return NextResponse.json(payload);
  }
}

