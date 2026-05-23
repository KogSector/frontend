export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return mock data until billing service is created
    const mockData = {
      subscription: null,
      payment_methods: [],
      recent_invoices: [],
      usage: [
        {
          resource_type: 'repositories',
          usage_count: 3,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
        },
        {
          resource_type: 'documents',
          usage_count: 12,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
        },
        {
          resource_type: 'api_calls',
          usage_count: 1247,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching billing dashboard:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch billing dashboard' 
    }, { status: 500 });
  }
}