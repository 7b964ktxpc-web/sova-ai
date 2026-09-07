import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/database/supabase'
import { getAIProviderResponse } from '@/lib/ai/providers'
import { withRateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await withRateLimit(request, 'telegram')
    if (!rateLimit.allowed) {
      return NextResponse.json({ ok: true })
    }

    const body = await request.json()

    const message = body.message || body.edited_message || body.channel_post
    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id.toString()
    const userId = message.from?.id?.toString()
    const text = message.text
    const assistantId = process.env.TELEGRAM_DEFAULT_ASSISTANT_ID

    if (!assistantId) {
      return NextResponse.json({ error: 'Default assistant not configured' }, { status: 500 })
    }

    const supabase = createServiceRoleClient()

    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('assistant_id', assistantId)
      .eq('external_user_id', userId)
      .limit(1)

    let conversationId: string
    const existingConversations = conversations || []
    if (existingConversations.length > 0) {
      conversationId = existingConversations[0].id
    } else {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          assistant_id: assistantId,
          external_user_id: userId,
          metadata: { telegram_chat_id: chatId },
        })
        .select()
        .single()

      if (error || !newConv) {
        return NextResponse.json({ error: 'Не удалось создать разговор' }, { status: 500 })
      }

      conversationId = newConv.id
    }

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: text,
    })

    const { data: configData } = await supabase
      .from('assistant_versions')
      .select('*')
      .eq('assistant_id', assistantId)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const configuration = configData?.configuration

    let systemPrompt = `Ты — ${configuration?.role || "AI-помощник"}.\n`
    systemPrompt += `Твоя главная задача: ${configuration?.objective || "помогать пользователю"}\n`
    systemPrompt += `Стиль общения: ${configuration?.tone || "дружелюбный"}\n`
    systemPrompt += `Язык: ${configuration?.language || "русский"}\n`

    if (configuration?.forbidden_actions?.length > 0) {
      systemPrompt += `Запрещено:\n${configuration.forbidden_actions.map((a: string) => `• ${a}`).join("\n")}\n`
    }

    const aiResponse = await generateAIResponse(text, systemPrompt, assistantId)

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse,
    })

    await sendTelegramMessage(chatId.toString(), aiResponse)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

async function generateAIResponse(message: string, systemPrompt: string, assistantId: string): Promise<string> {
  try {
    const supabase = createServiceRoleClient()
    const { data: providerConfig } = await supabase
      .from('assistant_provider_configs')
      .select('*, ai_providers(*)')
      .eq('assistant_id', assistantId)
      .single()

    if (!providerConfig) {
      return "Извините, AI-провайдер не настроен."
    }

    const response = await getAIProviderResponse(
      (providerConfig as { provider?: string }).provider || "openai",
      [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: message },
      ],
      {
        model: providerConfig.model,
        temperature: providerConfig.temperature,
        maxTokens: providerConfig.max_tokens,
      }
    )

    return response
  } catch (error) {
    console.error("AI generation error:", error)
    return "Извините, произошла ошибка. Попробуйте позже."
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  })
}
