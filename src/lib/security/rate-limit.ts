import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/database/supabase'

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

const RATE_LIMITS = {
  chat: { windowMs: 60_000, maxRequests: 20 },
  generate: { windowMs: 60_000, maxRequests: 5 },
  knowledge: { windowMs: 60_000, maxRequests: 10 },
  assistants: { windowMs: 60_000, maxRequests: 30 },
  telegram: { windowMs: 1000, maxRequests: 30 },
}

async function getClientIdentifier(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (token) {
    try {
      const supabase = createServiceRoleClient()
      const { data } = await supabase.auth.getUser(token)
      if (data.user) {
        return `user:${data.user.id}`
      }
    } catch {
      // ignore
    }
  }

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

async function checkRateLimit(
  identifier: string,
  route: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  const supabase = createServiceRoleClient()
  const limit = RATE_LIMITS[route]
  const windowStart = new Date(Date.now() - limit.windowMs).toISOString()

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('route', route)
    .gte('window_start', windowStart)
    .single()

  if (existing) {
    if (existing.count >= limit.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(new Date(existing.window_start).getTime() + limit.windowMs).getTime(),
      }
    }

    const { error } = await supabase
      .from('rate_limits')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id)

    if (error) {
      return { allowed: true, remaining: limit.maxRequests - 1, resetAt: Date.now() + limit.windowMs }
    }

    return {
      allowed: true,
      remaining: limit.maxRequests - existing.count - 1,
      resetAt: new Date(new Date(existing.window_start).getTime() + limit.windowMs).getTime(),
    }
  }

  await supabase.from('rate_limits').insert({
    identifier,
    route,
    count: 1,
    window_start: new Date().toISOString(),
  })

  return {
    allowed: true,
    remaining: limit.maxRequests - 1,
    resetAt: Date.now() + limit.windowMs,
  }
}

export async function withRateLimit(
  request: NextRequest,
  route: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; result?: RateLimitResult }> {
  const identifier = await getClientIdentifier(request)
  const result = await checkRateLimit(identifier, route)

  if (!result.allowed) {
    return {
      allowed: false,
      result,
    }
  }

  return { allowed: true, result }
}

export function addRateLimitHeaders(response: NextResponse, result: RateLimitResult) {
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString())
}
