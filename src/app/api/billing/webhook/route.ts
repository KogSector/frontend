export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || '';
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:3010';

    const res = await fetch(`${authUrl}/api/v1/billing/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
      },
      body: rawBody,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error forwarding webhook to auth-middleware:', error);
    return NextResponse.json({ error: 'Webhook proxy failure' }, { status: 500 });
  }
}
