export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return mock subscription data until billing service is created
    const mockSubscription = {
      subscription: null,
      plan: null
    };

    return NextResponse.json({
      success: true,
      data: mockSubscription
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch subscription' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Mock subscription creation until billing service is created
    return NextResponse.json({
      success: true,
      data: {
        message: 'Subscription creation not yet implemented',
        status: 'mock'
      }
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to create subscription' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Mock subscription update until billing service is created
    return NextResponse.json({
      success: true,
      data: {
        message: 'Subscription update not yet implemented',
        status: 'mock'
      }
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to update subscription' 
    }, { status: 500 });
  }
}