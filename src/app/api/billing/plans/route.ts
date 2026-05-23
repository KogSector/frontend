export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock plans data until billing service is created
    const mockPlans = [
      {
        id: 'plan-free',
        name: 'Free',
        tier: 'free',
        price_monthly: 0,
        features: {
          repositories: true,
          documents: true,
          basic_search: true,
          api_access: true
        },
        limits: {
          max_repositories: 5,
          max_documents: 100,
          max_api_calls_per_month: 1000,
          max_team_members: 2
        }
      },
      {
        id: 'plan-pro',
        name: 'Pro',
        tier: 'pro',
        price_monthly: 29.99,
        features: {
          repositories: true,
          documents: true,
          advanced_search: true,
          ai_features: true,
          api_access: true,
          priority_support: true
        },
        limits: {
          max_repositories: 50,
          max_documents: 10000,
          max_api_calls_per_month: 100000,
          max_team_members: 10
        }
      },
      {
        id: 'plan-enterprise',
        name: 'Enterprise',
        tier: 'enterprise',
        price_monthly: 99.99,
        features: {
          repositories: true,
          documents: true,
          advanced_search: true,
          ai_features: true,
          api_access: true,
          priority_support: true,
          custom_integrations: true,
          dedicated_account_manager: true
        },
        limits: {
          max_repositories: null, // unlimited
          max_documents: null, // unlimited
          max_api_calls_per_month: null, // unlimited
          max_team_members: null // unlimited
        }
      }
    ];

    return NextResponse.json(mockPlans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}