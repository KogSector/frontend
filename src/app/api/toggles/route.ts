import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL }) 
  : null;

export async function GET() {
  if (!pool) {
    return NextResponse.json(
      { success: false, message: 'Database connection not configured' },
      { status: 500 }
    );
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
      
      return NextResponse.json({
        success: true,
        data: toggles,
      });
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
