import { getAIProviderResponse } from './providers'

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatOptions {
  provider?: string
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  systemPrompt?: string
}

export async function chatCompletion(options: ChatOptions & { messages: ChatMessage[] }): Promise<string> {
  const messages = options.systemPrompt
    ? [{ role: "system" as const, content: options.systemPrompt }, ...options.messages]
    : options.messages

  return getAIProviderResponse(
    options.provider || "openai",
    messages,
    {
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      topP: options.topP,
    }
  )
}

export async function generateText(options: ChatOptions & { prompt: string }): Promise<string> {
  return getAIProviderResponse(
    options.provider || "openai",
    [{ role: "user", content: options.prompt }],
    {
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    }
  )
}
