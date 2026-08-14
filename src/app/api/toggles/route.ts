import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const rawUrl = process.env.DATABASE_URL?.replace(/^"|"$/g, '');
const pool = rawUrl
  ? new Pool({
      connectionString: rawUrl.includes('sslmode') ? rawUrl : `${rawUrl}?sslmode=verify-full`,
      ssl: { rejectUnauthorized: false }
    })
  : null;

let cachedTogglePayload: { success: boolean; data: Record<string, any> } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 3000;

// Hardcoded default toggles for local dev when DB/microservice is unavailable
const DEFAULT_TOGGLES: Record<string, any> = {
  enableRepositories: { enabled: true, description: 'Enable repositories pipeline and feature', category: 'features', categoryType: 'userFacing' },
  enableDocuments: { enabled: true, description: 'Enable documents pipeline and feature', category: 'features', categoryType: 'userFacing' },
  enableURLs: { enabled: false, description: 'Enable URLs pipeline and feature', category: 'features', categoryType: 'userFacing' },
  enableChats: { enabled: false, description: 'Enable chats pipeline and feature', category: 'features', categoryType: 'userFacing' },
  enableDesign: { enabled: false, description: 'Enable design options feature', category: 'features', categoryType: 'userFacing' },
  enableCloudLogs: { enabled: true, description: 'Enable cloud log ingestion and temporal retention', category: 'features', categoryType: 'userFacing' },
  agentRules: { enabled: false, description: 'Enable Agent Rules configuration feature', category: 'features', categoryType: 'userFacing' },
  deployedTesting: { enabled: false, description: 'Enable deployed testing limits and UI', category: 'features', categoryType: 'userFacing' },
  enableDeployedUrls: { enabled: false, description: 'Use deployed production URLs for all services', category: 'features', categoryType: 'userFacing' },
  enableMicrosoftAuth: { enabled: false, description: 'Enable Microsoft Authentication login option', category: 'features', categoryType: 'userFacing' },
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

