import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = process.env.DATABASE_URL 
  ? new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'development' ? false : { rejectUnauthorized: false }
    }) 
  : null;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
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
        'SELECT * FROM feature_toggles.toggles WHERE name = $1',
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
