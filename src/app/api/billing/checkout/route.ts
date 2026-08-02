export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:3010';

    if (authHeader) {
      const res = await fetch(`${authUrl}/api/v1/billing/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({
      success: true,
      data: { checkoutUrl: '/billing' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
