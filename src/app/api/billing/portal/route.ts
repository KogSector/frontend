export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:3010';

    if (authHeader) {
      const res = await fetch(`${authUrl}/api/v1/billing/portal`, {
        method: 'POST',
        headers: { 'Authorization': authHeader },
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({
      success: true,
      data: { portalUrl: 'https://tryconfuse.lemonsqueezy.com/billing' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer portal' }, { status: 500 });
  }
}
