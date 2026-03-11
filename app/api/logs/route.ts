/**
 * Frontend log ingestion endpoint.
 *
 * The logger (lib/logger.ts) flushes buffered logs, performance metrics, and
 * user actions here. In development we just print them to the server console.
 * In production you'd forward to a structured logging backend.
 */
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    if (process.env.NODE_ENV !== 'production') {
      const logCount = Array.isArray(payload?.logs) ? payload.logs.length : 0
      const perfCount = Array.isArray(payload?.performance) ? payload.performance.length : 0
      const actionCount = Array.isArray(payload?.userActions) ? payload.userActions.length : 0
      console.log(
        `[logs] session=${payload?.sessionId} logs=${logCount} perf=${perfCount} actions=${actionCount}`
      )
    }

    // TODO: forward to centralised logging service (e.g. Loki, Datadog, etc.)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    // Never let a logging failure break the client
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
