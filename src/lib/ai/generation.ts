import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import type { AssistantConfiguration } from '@/types'

export async function generateAssistantConfiguration(
  description: string,
  purpose?: string
): Promise<AssistantConfiguration> {
  const prompt = `Ты — эксперт по настройке AI-помощников. На основе описания пользователя создай структурированную конфигурацию.

Описание пользователя: ${description}
${purpose ? `Назначение: ${purpose}` : ""}

Создай JSON объект со следующей структурой:
{
  "name": "Короткое имя помощника",
  "description": "Краткое описание",
  "role": "Роль помощника",
  "objective": "Главная задача",
  "tasks": ["Задача 1", "Задача 2"],
  "tone": "Стиль общения",
  "language": "Язык",
  "greeting": "Приветственное сообщение",
  "behavior_rules": ["Правило 1"],
  "clarification_rules": ["Если информации нет, спроси уточняющие вопросы"],
  "knowledge_rules": ["Как работать с базой знаний"],
  "allowed_actions": ["Что можно делать"],
  "forbidden_actions": ["Что нельзя делать"],
  "fallback_behavior": "Что делать, если информации нет"
}

Верни ТОЛЬКО JSON, без дополнительного текста.`

  try {
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxOutputTokens: 1024,
    })

    const text = result.text
    try {
      return JSON.parse(text) as AssistantConfiguration
    } catch {
      return extractConfigurationFromText(text)
    }
  } catch (error) {
    console.error("Generation error:", error)
    throw error
  }
}

function extractConfigurationFromText(text: string): AssistantConfiguration {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AssistantConfiguration
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
