export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://127.0.0.1:3010';
    try {
      const res = await fetch(`${authUrl}/api/v1/billing/plans`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback if auth-middleware is unreachable
    }

    const plans = [
      {
        id: 'plan-free',
        name: 'Free',
        tier: 'free',
        price_monthly: 0,
        formatted_price: '₹0/month',
        description: 'For individual developers getting started with code and document intelligence.',
        features: [
          'Up to 2 repos and 4 documents',
          '256 MB max storage size (processing stops when reached)',
          '80,000 requests per month',
          'Strong security (TLS 1.3, CSP, token blacklisting)'
        ],
        limits: {
          max_repositories: 2,
          max_documents: 4,
          max_storage_mb: 256,
          max_api_calls_per_month: 80000,
          max_connected_users: 0
        }
      },
      {
        id: 'plan-pro',
        name: 'ConFuse Pro',
        tier: 'pro',
        price_monthly: 800,
        formatted_price: '₹800.00/month',
        description: 'For power developers needing higher storage and expanded query limits.',
        features: [
          'Up to 5 repos and 10 documents',
          '512 MB max storage space',
          '160,000 requests per month',
          'Strong security (TLS 1.3, CSP, token blacklisting)'
        ],
        limits: {
          max_repositories: 5,
          max_documents: 10,
          max_storage_mb: 512,
          max_api_calls_per_month: 160000,
          max_connected_users: 0
        }
      },
      {
        id: 'plan-team',
        name: 'ConFuse Team',
        tier: 'team',
        price_monthly: 2300,
        formatted_price: '₹2,300.00/month',
        description: 'For engineering teams requiring shared databases and advanced security controls.',
        features: [
          'Up to 10 repos and 16 documents',
          '1,024 MB (1 GB) max space',
          '320,000 requests per month (for main user)',
          'Max 3 connected users (READ-ONLY database access)',
          'Advanced Security & RBAC read-only db tokens'
        ],
        limits: {
          max_repositories: 10,
          max_documents: 16,
          max_storage_mb: 1024,
          max_api_calls_per_month: 320000,
          max_connected_users: 3
        }
      },
      {
        id: 'plan-enterprise',
        name: 'ConFuse Enterprise',
        tier: 'enterprise',
        price_monthly: 4000,
        formatted_price: '₹4,000.00+/month',
        description: 'For enterprise teams requiring high throughput, dedicated quotas, and custom compliance.',
        features: [
          'Custom / Unlimited repos and documents',
          'Dedicated Storage Quota (> 5 GB+)',
          'Custom High-Throughput (1,000,000+ requests/mo)',
          'Unlimited Read Seats & Multi-User Admin Write Roles',
          'Enterprise Security (SAML/SSO, Custom VPC/IP Isolation, Dedicated SLA)'
        ],
        limits: {
          max_repositories: null,
          max_documents: null,
          max_storage_mb: 5120,
          max_api_calls_per_month: 1000000,
          max_connected_users: 99999
        }
      }
    ];

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}