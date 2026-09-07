import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/database/supabase"
import { getAIProviderResponse } from "@/lib/ai/providers"
import { withRateLimit } from "@/lib/security/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await withRateLimit(request, 'generate')
    if (!rateLimit.allowed) {
      const response = NextResponse.json({ error: "Слишком много запросов. Попробуйте позже." }, { status: 429 })
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

    const { description, purpose } = await request.json()

    if (!description || !description.trim()) {
      return NextResponse.json({ error: "Необходимо указать описание" }, { status: 400 })
    }

    const sanitizedDescription = description.trim().slice(0, 5000)
    const sanitizedPurpose = purpose?.trim().slice(0, 1000) || ''

    const { data: defaultProvider } = await supabase
      .from("ai_providers")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single()

    if (!defaultProvider) {
      return NextResponse.json({ error: "AI провайдер не настроен" }, { status: 500 })
    }

    const prompt = generateConfigurationPrompt(sanitizedDescription, sanitizedPurpose)

    try {
      const response = await getAIProviderResponse(
        (defaultProvider.provider as string) || "openai",
        [{ role: "user" as const, content: prompt }],
        {
          model: (defaultProvider.model as string) || "gpt-4o-mini",
        }
      )

      try {
        const configuration = JSON.parse(response)
        return NextResponse.json(configuration)
      } catch {
        return NextResponse.json({ configuration: extractConfigurationFromText(response) })
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError)
      return NextResponse.json(
        { error: "Не удалось сгенерировать конфигурацию. Попробуйте позже." },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json(
      { error: "Произошла ошибка при генерации конфигурации" },
      { status: 500 }
    )
  }
}

function generateConfigurationPrompt(description: string, purpose?: string): string {
  return `Ты — эксперт по настройке AI-помощников. На основе описания пользователя создай структурированную конфигурацию.

Описание пользователя: ${description}
${purpose ? `Назначение: ${purpose}` : ""}

Создай JSON объект со следующей структурой:
{
  "name": "Короткое имя помощника",
  "description": "Краткое описание",
  "role": "Роль помощника (например: консультант магазина)",
  "objective": "Главная задача",
  "tasks": ["Задача 1", "Задача 2"],
  "tone": "Стиль общения (дружелюбный, профессиональный, краткий)",
  "language": "Язык (русский)",
  "greeting": "Приветственное сообщение",
  "behavior_rules": ["Правило 1", "Правило 2"],
  "clarification_rules": ["Если информации нет, спроси уточняющие вопросы"],
  "knowledge_rules": ["Как работать с базой знаний"],
  "allowed_actions": ["Что можно делать"],
  "forbidden_actions": ["Что нельзя делать"],
  "fallback_behavior": "Что делать, если информации нет"
}

Верни ТОЛЬКО JSON, без дополнительного текста.`
}

function extractConfigurationFromText(text: string): Record<string, unknown> {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // ignore
  }

  return {
    name: "AI-помощник",
    description: text.slice(0, 200),
    role: "AI-помощник",
    objective: text.slice(0, 200),
    tasks: [],
    tone: "дружелюбный",
    language: "русский",
    greeting: "Привет! Чем могу помочь?",
    behavior_rules: [],
    clarification_rules: [],
    knowledge_rules: [],
    allowed_actions: [],
    forbidden_actions: [],
    fallback_behavior: "Предложите связаться с сотрудником",
  }
}
