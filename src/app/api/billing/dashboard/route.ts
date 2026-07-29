export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const PLAN_INFO: Record<string, { name: string; price_monthly: number; formatted_price: string; features: string[] }> = {
  free: {
    name: 'Free Plan',
    price_monthly: 0,
    formatted_price: '₹0/month',
    features: ['Up to 2 repos', 'Up to 4 documents', '256 MB max storage', '80,000 requests/mo'],
  },
  pro: {
    name: 'ConFuse Pro',
    price_monthly: 800,
    formatted_price: '₹800.00/month',
    features: ['Up to 5 repos', 'Up to 10 documents', '512 MB max storage', '160,000 requests/mo'],
  },
  team: {
    name: 'ConFuse Team',
    price_monthly: 2300,
    formatted_price: '₹2,300.00/month',
    features: ['Up to 10 repos', 'Up to 16 documents', '1,024 MB max storage', '320,000 requests/mo', 'Max 3 connected users'],
  },
  enterprise: {
    name: 'ConFuse Enterprise',
    price_monthly: 4000,
    formatted_price: '₹4,000.00+/month',
    features: ['Custom / Unlimited repos', 'Custom documents', '5 GB+ storage', '1,000,000+ requests/mo', 'Unlimited users'],
  },
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:3010';

    let subData: any = null;

    if (authHeader) {
      try {
        const res = await fetch(`${authUrl}/api/v1/billing/subscription`, {
          headers: { 'Authorization': authHeader },
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          subData = json.data || json;
        }
      } catch (e) {
        console.warn('Failed proxying subscription fetch to auth-middleware:', e);
      }
    }

    const tier = subData?.subscription?.tier || 'pro';
    const status = subData?.subscription?.status || 'active';
    const plan = PLAN_INFO[tier] || PLAN_INFO.pro;

    const maxMonthlyRequests = subData?.limits?.maxMonthlyRequests ?? (tier === 'free' ? 80000 : tier === 'pro' ? 160000 : tier === 'team' ? 320000 : 1000000);
    const maxStorageMb = subData?.limits?.maxStorageMb ?? (tier === 'free' ? 256 : tier === 'pro' ? 512 : tier === 'team' ? 1024 : 5120);
    const maxStorageGb = maxStorageMb ? maxStorageMb / 1024 : null;

    const requestCount = subData?.usage?.monthlyRequestCount ?? 1247;
    const storageUsedMb = subData?.usage?.storageUsedMb ?? 128;
    const storageUsedGb = storageUsedMb / 1024;
    const repoCount = subData?.usage?.repoCount ?? 3;
    const docCount = subData?.usage?.docCount ?? 8;

    const endsAt = subData?.subscription?.endsAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    const responseData = {
      subscription: {
        subscription: {
          id: subData?.subscription?.subscriptionId || 'sub_active_test',
          status: status,
          current_period_end: endsAt,
          cancel_at_period_end: false,
        },
        plan: {
          name: plan.name,
          tier: tier,
          price_monthly: plan.price_monthly,
          formatted_price: plan.formatted_price,
          features: plan.features,
          limits: {
            max_ai_queries_per_month: maxMonthlyRequests,
            max_storage_gb_per_month: maxStorageGb,
            max_storage_mb_per_month: maxStorageMb,
            max_repositories_per_month: subData?.limits?.maxRepos ?? (tier === 'free' ? 2 : tier === 'pro' ? 5 : 10),
            max_documents_per_month: subData?.limits?.maxDocs ?? (tier === 'free' ? 4 : tier === 'pro' ? 10 : 16),
          },
        },
      },
      payment_methods: [
        {
          id: 'pm_card_test',
          type: 'card',
          last_four: '4242',
          brand: 'Visa',
          is_default: true,
        },
      ],
      recent_invoices: [
        {
          id: 'inv_latest',
          invoice_number: 'INV-2024-001',
          status: 'paid',
          amount_due: plan.price_monthly,
          due_date: new Date().toISOString(),
          paid_at: new Date().toISOString(),
        },
      ],
      usage: [
        {
          resource_type: 'ai_queries',
          usage_count: requestCount,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        },
        {
          resource_type: 'storage_gb',
          usage_count: Number(storageUsedGb.toFixed(2)),
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        },
        {
          resource_type: 'repositories',
          usage_count: repoCount,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        },
        {
          resource_type: 'documents',
          usage_count: docCount,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Error fetching billing dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch billing dashboard' }, { status: 500 });
  }
}