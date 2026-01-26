import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Frontend observability logs endpoint
 * Receives logs, performance metrics, and user actions from the client
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      if (payload.logs?.length > 0) {
        console.log('[Frontend Logs]', payload.logs.length, 'entries');
      }
      if (payload.performance?.length > 0) {
        console.log('[Performance Metrics]', payload.performance.length, 'entries');
      }
    }
    
    // In production, you could forward to an observability service like:
    // - Datadog
    // - New Relic
    // - Custom logging service
    
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Error processing logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process logs' },
      { status: 400 }
    );
  }
}
