import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const rawUrl = process.env.DATABASE_URL?.replace(/^"|"$/g, '');
const pool = rawUrl
  ? new Pool({
      connectionString: rawUrl.includes('sslmode') ? rawUrl : `${rawUrl}?sslmode=verify-full`,
      ssl: { rejectUnauthorized: false }
    })
  : null;

const DEFAULT_TOGGLES: Record<string, any> = {
  enableRepositories: { name: 'enableRepositories', enabled: true, description: 'Enable repositories pipeline and feature', category: 'features', category_type: 'userFacing' },
  enableDocuments: { name: 'enableDocuments', enabled: true, description: 'Enable documents pipeline and feature', category: 'features', category_type: 'userFacing' },
  enableURLs: { name: 'enableURLs', enabled: false, description: 'Enable URLs pipeline and feature', category: 'features', category_type: 'userFacing' },
  enableChats: { name: 'enableChats', enabled: false, description: 'Enable chats pipeline and feature', category: 'features', category_type: 'userFacing' },
  enableDesign: { name: 'enableDesign', enabled: false, description: 'Enable design options feature', category: 'features', category_type: 'userFacing' },
  enableCloudLogs: { name: 'enableCloudLogs', enabled: true, description: 'Enable cloud log ingestion and temporal retention', category: 'features', category_type: 'userFacing' },
  agentRules: { name: 'agentRules', enabled: false, description: 'Enable Agent Rules configuration feature', category: 'features', category_type: 'userFacing' },
  deployedTesting: { name: 'deployedTesting', enabled: false, description: 'Enable deployed testing limits and UI', category: 'features', category_type: 'userFacing' },
  enableDeployedUrls: { name: 'enableDeployedUrls', enabled: false, description: 'Use deployed production URLs for all services', category: 'features', category_type: 'userFacing' },
  enableMicrosoftAuth: { name: 'enableMicrosoftAuth', enabled: false, description: 'Enable Microsoft Authentication login option', category: 'features', category_type: 'userFacing' },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  if (!pool) {
    const toggle = DEFAULT_TOGGLES[name];
    if (!toggle) return NextResponse.json({ success: false, message: 'Toggle not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: toggle });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT name, enabled, description, category, category_type FROM feature_toggles.toggles WHERE name = $1',
        [name]
      );
      if (result.rows.length === 0) {
        const toggle = DEFAULT_TOGGLES[name];
        if (!toggle) return NextResponse.json({ success: false, message: 'Toggle not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: toggle });
      }
      return NextResponse.json({ success: true, data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch {
    const toggle = DEFAULT_TOGGLES[name];
    if (!toggle) return NextResponse.json({ success: false, message: 'Toggle not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: toggle });
  }
}
