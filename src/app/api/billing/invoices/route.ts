export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return mock invoices data until billing service is created
    const mockInvoices = [
      {
        id: 'INV-MOCK-001',
        invoice_number: 'INV-2024-001',
        status: 'paid',
        amount_due: 29.99,
        due_date: '2024-09-01',
        paid_at: '2024-09-01',
        download_url: '#'
      },
      {
        id: 'INV-MOCK-002',
        invoice_number: 'INV-2024-002',
        status: 'paid',
        amount_due: 29.99,
        due_date: '2024-10-01',
        paid_at: '2024-10-01',
        download_url: '#'
      }
    ];

    return NextResponse.json(mockInvoices);

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch invoices' 
    }, { status: 500 });
  }
}