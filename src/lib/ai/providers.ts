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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: messages as any,
        ...modelOptions,
      }).then(result => result.text)

    case "anthropic":
      return generateText({
        model: anthropic(options?.model || "claude-3-5-haiku-20241022"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: messages as any,
        ...modelOptions,
      }).then(result => result.text)

    case "google":
      return generateText({
        model: google(options?.model || "gemini-1.5-flash"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: messages as any,
        ...modelOptions,
      }).then(result => result.text)

    case "groq":
      return generateText({
        model: groq(options?.model || "llama-3.1-70b-versatile"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: messages as any,
        ...modelOptions,
      }).then(result => result.text)

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
