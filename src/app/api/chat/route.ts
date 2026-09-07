import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/database/supabase"
import { getAIProviderResponse } from "@/lib/ai/providers"
import { withRateLimit } from "@/lib/security/rate-limit"
import { sanitizeInput } from "@/lib/security/validation"

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await withRateLimit(request, 'chat')
    if (!rateLimit.allowed) {
      const response = NextResponse.json({ error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 })
      response.headers.set('Retry-After', Math.ceil((rateLimit.result!.resetAt - Date.now()) / 1000).toString())
      return response
    }

    const supabase = createServiceRoleClient()
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { assistantId, message, conversationId } = await request.json()

    if (!assistantId || !message) {
      return NextResponse.json(
        { error: "Необходимо указать assistantId и message" },
        { status: 400 }
      )
    }

    const sanitizedMessage = sanitizeInput(message)
    if (!sanitizedMessage || sanitizedMessage.length > 10000) {
      return NextResponse.json({ error: "Сообщение слишком длинное" }, { status: 400 })
    }

    const { data: assistant, error: assistantError } = await supabase
      .from("assistants")
      .select("*")
      .eq("id", assistantId)
      .eq("user_id", user.id)
      .single()

    if (assistantError || !assistant) {
      return NextResponse.json(
        { error: "Помощник не найден или нет доступа" },
        { status: 404 }
      )
    }

    const { data: configData } = await supabase
      .from("assistant_versions")
      .select("*")
      .eq("assistant_id", assistantId)
      .order("version", { ascending: false })
      .limit(1)
      .single()

    const configuration = configData?.configuration

    const { data: providerConfig } = await supabase
      .from("assistant_provider_configs")
      .select("*, ai_providers(*)")
      .eq("assistant_id", assistantId)
      .single()

    if (!providerConfig) {
      return NextResponse.json(
        { error: "AI провайдер не настроен" },
        { status: 400 }
      )
    }

    let conversationIdToUse = conversationId
    if (!conversationIdToUse) {
      const { data: newConversation } = await supabase
        .from("conversations")
        .insert({
          assistant_id: assistantId,
          metadata: {},
        })
        .select()
        .single()

      conversationIdToUse = newConversation?.id
    }

    if (!conversationIdToUse) {
      return NextResponse.json({ error: "Не удалось создать разговор" }, { status: 500 })
    }

    await supabase.from("messages").insert({
      conversation_id: conversationIdToUse,
      role: "user",
      content: sanitizedMessage,
    })

    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = []

    if (configuration?.greeting) {
      messages.push({
        role: "system",
        content: configuration.greeting,
      })
    }

    const systemPrompt = buildSystemPrompt(configuration, assistant)
    messages.push({
      role: "system",
      content: systemPrompt,
    })

    messages.push({
      role: "user",
      content: sanitizedMessage,
    })

    const providerConfigData = providerConfig as { provider?: string; model?: string; temperature?: number; max_tokens?: number }
    const response = await getAIProviderResponse(
      providerConfigData.provider || "openai",
      messages,
      {
        model: providerConfig.model,
        temperature: providerConfig.temperature,
        maxTokens: providerConfig.max_tokens,
      }
    )

    await supabase.from("messages").insert({
      conversation_id: conversationIdToUse,
      role: "assistant",
      content: response,
      metadata: {},
    })

    await supabase.from("usage_events").insert({
      user_id: assistant.user_id,
      assistant_id: assistantId,
      event_type: "chat_message",
      metadata: {
        conversation_id: conversationIdToUse,
      },
      tokens_used: response.length,
    })

    const responseObj = NextResponse.json({
      response,
      conversationId: conversationIdToUse,
    })

    if (rateLimit.result) {
      responseObj.headers.set('X-RateLimit-Remaining', rateLimit.result.remaining.toString())
      responseObj.headers.set('X-RateLimit-Reset', new Date(rateLimit.result.resetAt).toISOString())
    }

    return responseObj
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Произошла ошибка при обработке сообщения" },
      { status: 500 }
    )
  }
}

function buildSystemPrompt(configuration: Record<string, unknown> | null, assistant: Record<string, unknown>): string {
  if (!configuration) {
    const name = (assistant.name as string) || "AI-помощник"
    const description = (assistant.description as string) || "Помогай пользователю."
    return `Ты — AI-помощник "${name}". ${description}`
  }

  const role = (configuration.role as string) || "AI-помощник"
  const objective = (configuration.objective as string) || "помогать пользователю"
  const tone = (configuration.tone as string) || "дружелюбный и полезный"
  const language = (configuration.language as string) || "русский"

  let prompt = `Ты — ${role}.\n\n`
  prompt += `Твоя главная задача: ${objective}\n\n`

  const tasks = configuration.tasks as string[] | undefined
  if (tasks && tasks.length > 0) {
    prompt += `Что ты умеешь:\n${tasks.map((task) => `• ${task}`).join("\n")}\n\n`
  }

  prompt += `Стиль общения: ${tone}\n`
  prompt += `Язык: ${language}\n\n`

  const behaviorRules = configuration.behavior_rules as string[] | undefined
  if (behaviorRules && behaviorRules.length > 0) {
    prompt += `Правила поведения:\n${behaviorRules.map((rule) => `• ${rule}`).join("\n")}\n\n`
  }

  const forbiddenActions = configuration.forbidden_actions as string[] | undefined
  if (forbiddenActions && forbiddenActions.length > 0) {
    prompt += `Запрещено:\n${forbiddenActions.map((action) => `• ${action}`).join("\n")}\n\n`
  }

  const fallbackBehavior = configuration.fallback_behavior as string | undefined
  if (fallbackBehavior) {
    prompt += `Если информации нет: ${fallbackBehavior}\n`
  }

  return prompt
}
