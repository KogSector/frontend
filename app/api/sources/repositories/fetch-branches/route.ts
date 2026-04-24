import { NextRequest, NextResponse } from 'next/server';
import { dataClient } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    console.log('[API /api/data-sources/repositories/fetch-branches] POST called');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward to data-connector
    const resp = await dataClient.post('/api/repositories/fetch-branches', body, headers);
    
    console.log('[API /api/sources/repositories/fetch-branches] data-connector response success');
    
    return NextResponse.json(resp);
  } catch (error: any) {
    console.error('[API /api/sources/repositories/fetch-branches] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch branches'
    }, { status: 500 });
  }
}
