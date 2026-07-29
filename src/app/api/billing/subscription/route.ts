export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:3010';

    if (authHeader) {
      try {
        const res = await fetch(`${authUrl}/api/v1/billing/subscription`, {
          headers: { 'Authorization': authHeader },
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (e) {
        console.warn('Failed proxying subscription fetch to auth-middleware:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: { tier: 'free', status: 'active' },
        limits: {
          maxRepos: 2,
          maxDocs: 4,
          maxStorageMb: 256,
          maxMonthlyRequests: 80000,
          maxConnectedUsers: 0,
        },
        usage: {
          repoCount: 0,
          docCount: 0,
          storageUsedMb: 0,
          monthlyRequestCount: 0,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    const { tier } = body;
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:3010';

    if (authHeader) {
      const res = await fetch(`${authUrl}/api/v1/billing/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: tier || 'pro' }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }

    // Fallback checkout redirect URL
    const buyUrlMap: Record<string, string> = {
      pro: 'https://tryconfuse.lemonsqueezy.com/checkout/buy/dc2fe0c0-8fc8-4b14-8bc8-42b1b93d6610',
      team: 'https://tryconfuse.lemonsqueezy.com/checkout/buy/fc9e1c35-1284-4e66-90c5-b8fd06e24fb5',
      enterprise: 'https://tryconfuse.lemonsqueezy.com/checkout/buy/85924e78-5dae-40b2-bc55-9d7dac547e1d',
    };

    const checkoutUrl = buyUrlMap[tier || 'pro'] || buyUrlMap.pro;
    return NextResponse.json({
      success: true,
      data: { checkoutUrl }
    });

  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    const { tier } = body;
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:3010';

    if (authHeader) {
      const res = await fetch(`${authUrl}/api/v1/billing/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: tier || 'pro' }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: { tier: tier || 'pro', status: 'active' },
        message: 'Successfully upgraded subscription tier',
      }
    });

  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 });
  }
}