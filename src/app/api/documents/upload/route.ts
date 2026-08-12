import { NextRequest, NextResponse } from 'next/server';
import { SERVICE_URLS } from '@/lib/config';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const userIdHeader = request.headers.get('x-user-id');
    const upstreamUrl = `${SERVICE_URLS.docDataCon}/api/documents/upload`;

    // #region debug-point A:upload-proxy-target
    (() => { let u = 'http://127.0.0.1:7777/event', s = 'document-upload-econnrefused'; try { const e = fs.readFileSync('c:\\Users\\risha\\Desktop\\Work\\.dbg\\document-upload-econnrefused.env', 'utf8'); u = e.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || u; s = e.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || s; } catch { } fetch(u, { method: 'POST', body: JSON.stringify({ sessionId: s, runId: 'pre-fix', hypothesisId: 'A', location: 'src/app/api/documents/upload/route.ts:12', msg: '[DEBUG] upload proxy resolved upstream', data: { upstreamUrl, docDataCon: SERVICE_URLS.docDataCon, hasAuthHeader: Boolean(authHeader), userIdHeader, fileCount: formData.getAll('files').length }, ts: Date.now() }) }).catch(() => { }); })();
    // #endregion

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(userIdHeader ? { 'x-user-id': userIdHeader } : {}),
      },
      body: formData,
      cache: 'no-store',
    });

    const contentType = upstreamResponse.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await upstreamResponse.json();
      return NextResponse.json(data, { status: upstreamResponse.status });
    }

    const text = await upstreamResponse.text();
    return NextResponse.json(
      {
        success: upstreamResponse.ok,
        message: text || upstreamResponse.statusText,
      },
      { status: upstreamResponse.status }
    );
  } catch (error) {
    // #region debug-point B:upload-proxy-error
    (() => { let u = 'http://127.0.0.1:7777/event', s = 'document-upload-econnrefused'; try { const e = fs.readFileSync('c:\\Users\\risha\\Desktop\\Work\\.dbg\\document-upload-econnrefused.env', 'utf8'); u = e.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || u; s = e.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || s; } catch { } const err = error instanceof Error ? { name: error.name, message: error.message, cause: String((error as Error & { cause?: unknown }).cause ?? '') } : { name: 'unknown', message: String(error), cause: '' }; fetch(u, { method: 'POST', body: JSON.stringify({ sessionId: s, runId: 'pre-fix', hypothesisId: 'B', location: 'src/app/api/documents/upload/route.ts:38', msg: '[DEBUG] upload proxy failed', data: err, ts: Date.now() }) }).catch(() => { }); })();
    // #endregion
    console.error('Error proxying document upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload documents',
      },
      { status: 502 }
    );
  }
}
