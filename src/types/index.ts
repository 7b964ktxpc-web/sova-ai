export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan: 'free' | 'pro' | 'business'
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Assistant {
  id: string
  user_id: string
  name: string
  description?: string
  avatar_url?: string
  is_active: boolean
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AssistantVersion {
  id: string
  assistant_id: string
  version: number
  configuration: Record<string, unknown>
  created_at: string
}

export interface AssistantConfiguration {
  name: string
  description?: string
  role: string
  objective: string
  tasks: string[]
  tone: string
  language: string
  greeting?: string
  behavior_rules: string[]
  clarification_rules: string[]
  knowledge_rules: string[]
  allowed_actions: string[]
  forbidden_actions: string[]
  fallback_behavior: string
}

export interface AIProvider {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'groq'
  is_active: boolean
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AssistantProviderConfig {
  id: string
  assistant_id: string
  provider_id: string
  model: string
  temperature: number
  max_tokens: number
  top_p: number
  settings: Record<string, unknown>
  created_at: string
}

export interface KnowledgeDocument {
  id: string
  assistant_id: string
  user_id: string
  name: string
  type: string
  size?: number
  status: 'uploading' | 'processing' | 'ready' | 'error'
  error_message?: string
  storage_path?: string
  chunk_count: number
  created_at: string
  processed_at?: string
}

export interface KnowledgeChunk {
  id: string
  document_id: string
  assistant_id: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface Channel {
  id: string
  assistant_id: string
  type: 'telegram' | 'web' | 'api'
  is_active: boolean
  config: Record<string, unknown>
  webhook_url?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  assistant_id: string
  user_id?: string
  channel_id?: string
  external_user_id?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface UsageEvent {
  id: string
  user_id: string
  assistant_id?: string
  event_type: string
  metadata: Record<string, unknown>
  tokens_used: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'pro' | 'business'
  status: 'active' | 'canceled' | 'past_due'
  current_period_start?: string
  current_period_end?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  metadata: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface CreateAssistantInput {
  name: string
  description?: string
  purpose?: string
  configuration?: Partial<Record<string, unknown>>
}

export interface OnboardingStep {
  id: number
  title: string
  description: string
  completed: boolean
}
