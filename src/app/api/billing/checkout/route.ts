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

    const buyUrlMap: Record<string, string> = {
      pro: 'https://tryconfuse.lemonsqueezy.com/checkout/buy/dc2fe0c0-8fc8-4b14-8bc8-42b1b93d6610',
      team: 'https://tryconfuse.lemonsqueezy.com/checkout/buy/fc9e1c35-1284-4e66-90c5-b8fd06e24fb5',
      enterprise: 'https://tryconfuse.lemonsqueezy.com/checkout/buy/85924e78-5dae-40b2-bc55-9d7dac547e1d',
    };

    return NextResponse.json({
      success: true,
      data: { checkoutUrl: buyUrlMap[body.tier] || buyUrlMap.pro }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
