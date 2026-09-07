import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/database/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assistantId } = body

    if (!assistantId) {
      return NextResponse.json({ error: 'Assistant ID required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: assistant } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', assistantId)
      .eq('user_id', user.id)
      .single()

    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sova-ai-lemon.vercel.app'

    if (!botToken) {
      return NextResponse.json({ error: 'Telegram bot token not configured' }, { status: 500 })
    }

    const webhookResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webAppUrl + '/api/telegram/webhook')}`
    )
    const webhookData = await webhookResponse.json()

    if (!webhookData.ok) {
      return NextResponse.json({ error: 'Failed to set webhook' }, { status: 500 })
    }

    const commands = [
      { command: 'start', description: 'Запустить бота и открыть Web App' },
      { command: 'help', description: 'Справка по использованию' },
      { command: 'assistants', description: 'Список доступных помощников' },
      { command: 'settings', description: 'Настройки профиля' },
    ]

    await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
    })

    return NextResponse.json({
      success: true,
      webhook: webAppUrl + '/api/telegram/webhook',
      commands: commands.length
    })
  } catch (error) {
    console.error('Telegram setup error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
