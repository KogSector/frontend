import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = process.env.DATABASE_URL 
  ? new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'development' ? false : { rejectUnauthorized: false }
    }) 
  : null;

let cachedTogglePayload: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 3000;

function getCachedPayload() {
  if (cachedTogglePayload && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedTogglePayload;
  }
  return null;
}

function setCachedPayload(payload: Record<string, any>) {
  cachedTogglePayload = payload;
  cacheTimestamp = Date.now();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {

  const cached = getCachedPayload();
  if (cached && cached.name === (await params).name) {
    return NextResponse.json({ success: true, data: cached });
  }
  if (!pool) {
    return NextResponse.json(
      { success: false, message: 'Database connection not configured' },
      { status: 500 }
    );
  }

  try {
    const resolvedParams = await params;
    const { name } = resolvedParams;
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM public.toggles WHERE name = $1',
        [name]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Toggle not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`[DB Fallback] Error fetching toggle from DB:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
