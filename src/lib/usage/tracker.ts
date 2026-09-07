import { createServiceRoleClient } from '@/lib/database/supabase'
import { createClientComponentClient } from '@/lib/database/supabase'
import type { UsageEvent } from '@/types'

export async function trackUsage(params: {
  userId: string
  assistantId?: string
  eventType: string
  metadata?: Record<string, unknown>
  tokensUsed?: number
}) {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('usage_events')
    .insert({
      user_id: params.userId,
      assistant_id: params.assistantId,
      event_type: params.eventType,
      metadata: params.metadata || {},
      tokens_used: params.tokensUsed || 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Не удалось записать событие: ${error.message}`)
  }
  return data as UsageEvent
}

export async function getUserUsageStats(userId: string, days: number = 30) {
  const supabase = createClientComponentClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('usage_events')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Не удалось получить статистику: ${error.message}`)
  }
  return data
}

export async function getAssistantUsageStats(assistantId: string, days: number = 30) {
  const supabase = createClientComponentClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('usage_events')
    .select('*')
    .eq('assistant_id', assistantId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Не удалось получить статистику: ${error.message}`)
  }
  return data
}

export function calculateTokensFromMessages(messages: Array<{ content: string }>): number {
  return messages.reduce((total, message) => {
    return total + Math.ceil(message.content.length / 4)
  }, 0)
}
