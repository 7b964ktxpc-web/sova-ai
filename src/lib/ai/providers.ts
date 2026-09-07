import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
}

export async function getAIProviderResponse(
  provider: string,
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<string> {
  const modelOptions = {
    temperature: options?.temperature ?? 0.7,
    maxOutputTokens: options?.maxTokens ?? 1024,
  }

  switch (provider) {
    case "openai":
      return generateText({
        model: openai(options?.model || "gpt-4o-mini"),
        messages: messages as any,
        ...modelOptions,
      }).then(result => result.text)

    case "anthropic":
      return generateText({
        model: anthropic(options?.model || "claude-3-5-haiku-20241022"),
        messages: messages as any,
        ...modelOptions,
      }).then(result => result.text)

    case "google":
      return generateText({
        model: google(options?.model || "gemini-1.5-flash"),
        messages: messages as any,
        ...modelOptions,
      }).then(result => result.text)

    case "groq":
      return generateText({
        model: groq(options?.model || "llama-3.1-70b-versatile"),
        messages: messages as any,
        ...modelOptions,
      }).then(result => result.text)

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

export async function getOpenRouterResponse(
  model: string,
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sova-ai-lemon.vercel.app',
      'X-Title': 'Sova AI',
    },
    body: JSON.stringify({
      model: model || 'meta-llama/llama-3.1-8b-instruct:free',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenRouter request failed')
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}