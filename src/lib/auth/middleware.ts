import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/database/supabase'

const publicPaths = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/callback', '/auth/telegram-callback', '/api/telegram/webhook']
const ADMIN_TELEGRAM_IDS = new Set(['1401549617'])

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p + '/'))
  const isApiRoute = path.startsWith('/api')
  const isProtected = !isPublicPath && path !== '/'

  if (isProtected || isApiRoute) {
    const accessToken = request.cookies.get('sb-access-token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '')
    
    const telegramId = request.headers.get('X-Telegram-Id')
    if (telegramId && ADMIN_TELEGRAM_IDS.has(telegramId)) {
      return NextResponse.next()
    }

    if (!accessToken) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
      }
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const supabase = createServiceRoleClient()
      const { data, error } = await supabase.auth.getUser(accessToken)
      if (error || !data.user) {
        if (isApiRoute) {
          return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
        }
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('callbackUrl', path)
        return NextResponse.redirect(loginUrl)
      }
    } catch {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
      }
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
