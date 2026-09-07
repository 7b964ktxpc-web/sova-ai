import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/database/supabase'

const ADMIN_TELEGRAM_IDS = new Set(['1401549617'])
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

function verifyTelegramAuth(initData: string) {
  if (!TELEGRAM_BOT_TOKEN) return null
  
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return null

    const userData = params.get('user')
    if (!userData) return null

    const user = JSON.parse(userData)
    const telegramId = user.id?.toString()
    
    if (telegramId && ADMIN_TELEGRAM_IDS.has(telegramId)) {
      return { telegramId, user }
    }
  } catch {
    // invalid data
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { initData } = body

    if (!initData) {
      return NextResponse.json({ error: 'initData required' }, { status: 400 })
    }

    const authResult = verifyTelegramAuth(initData)
    
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    
    let { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) throw error

    let user = users?.find((u) => (u.user_metadata as any)?.telegram_id === authResult.telegramId)
    
    if (!user) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: `telegram_${authResult.telegramId}@sova.ai`,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          telegram_id: authResult.telegramId,
          full_name: authResult.user?.first_name || 'Telegram User',
          role: 'admin',
        },
      })
      
      if (createError) throw createError
      user = newUser.user
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: user.id,
    })

    if (sessionError || !sessionData) {
      throw new Error('Failed to create session')
    }

    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        telegram_id: authResult.telegramId,
      }
    })

    response.cookies.set('sb-access-token', sessionData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.set('sb-refresh-token', sessionData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Telegram auth error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
