export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { SERVICE_URLS } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    // Define services to check
    const services = [
      { name: 'data-connector', url: SERVICE_URLS.dataConnector },
      { name: 'auth-middleware', url: SERVICE_URLS.auth },
      { name: 'unified-processor', url: SERVICE_URLS.unifiedProcessor },
      { name: 'embeddings-service', url: SERVICE_URLS.embeddingsService },
      { name: 'mcp-server', url: SERVICE_URLS.mcpServer }
    ]

    // Check health of all services
    const healthChecks = await Promise.allSettled(
      services.map(async service => {
        try {
          const response = await fetch(`${service.url}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000) // 5 second timeout
          })
          
          if (response.ok) {
            const data = await response.json()
            return {
              name: service.name,
              healthy: true,
              status: data.status || 'healthy',
              response_time: Date.now(),
              last_check: new Date().toISOString()
            }
          } else {
            return {
              name: service.name,
              healthy: false,
              status: 'unhealthy',
              error: `HTTP ${response.status}`,
              last_check: new Date().toISOString()
            }
          }
        } catch (error) {
          return {
            name: service.name,
            healthy: false,
            status: 'down',
            error: error instanceof Error ? error.message : 'Unknown error',
            last_check: new Date().toISOString()
          }
        }
      })
    )

    // Extract results
    const serviceStatus = healthChecks.map(check => 
      check.status === 'fulfilled' ? check.value : {
        name: 'unknown',
        healthy: false,
        status: 'error',
        error: 'Failed to check',
        last_check: new Date().toISOString()
      }
    )

    // Calculate overall health
    const healthyServices = serviceStatus.filter(s => s.healthy).length
    const totalServices = serviceStatus.length
    const overallScore = totalServices > 0 ? Math.round((healthyServices / totalServices) * 100) : 0
    const isHealthy = healthyServices === totalServices

    // Identify issues
    const issues = serviceStatus
      .filter(s => !s.healthy)
      .map(s => `${s.name}: ${s.error || s.status}`)

    return NextResponse.json({
      success: true,
      data: {
        healthy: isHealthy,
        overall_score: overallScore,
        service_status: serviceStatus,
        issues: issues,
        last_check: new Date().toISOString(),
        summary: {
          total_services: totalServices,
          healthy_services: healthyServices,
          unhealthy_services: totalServices - healthyServices
        }
      }
    })

  } catch (error) {
    console.error('Error checking system health:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check system health',
      data: {
        healthy: false,
        overall_score: 0,
        service_status: [],
        issues: ['Health check failed'],
        last_check: new Date().toISOString(),
        summary: {
          total_services: 0,
          healthy_services: 0,
          unhealthy_services: 0
        }
      }
    }, { status: 500 })
  }
}
