import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = process.env.DATABASE_URL 
  ? new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'development' ? false : { rejectUnauthorized: false }
    }) 
  : null;

let cachedTogglePayload: { success: boolean; data: Record<string, any> } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 3000;

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
  if (!pool) {
    return NextResponse.json(
      { success: false, message: 'Database connection not configured' },
      { status: 500 }
    );
  }

  const cached = getCachedPayload();
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT name, enabled, description, category, category_type as "categoryType", metadata FROM public.toggles'
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
    console.error(`[DB Fallback] Error fetching toggles from DB:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
