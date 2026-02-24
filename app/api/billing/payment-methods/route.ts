export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return mock payment methods data until billing service is created
    const mockPaymentMethods: Array<{}> = [];

    return NextResponse.json(mockPaymentMethods);

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch payment methods' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Mock payment method creation until billing service is created
    return NextResponse.json({
      success: true,
      data: {
        message: 'Payment method creation not yet implemented',
        status: 'mock'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json({ 
      error: 'Failed to add payment method' 
    }, { status: 500 });
  }
}