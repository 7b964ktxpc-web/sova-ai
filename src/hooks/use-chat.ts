'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/database/supabase'
import { chatCompletion } from '@/lib/ai/chat'
import { buildRagContext } from '@/lib/knowledge/rag'
import { trackUsage } from '@/lib/usage/tracker'
import { createMessage, createConversation, getMessages } from '@/lib/database/queries'
import type { ChatMessage } from '@/types'

export function useChat(assistantId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          setUserId(data.user.id)
        }
      } catch (err) {
        console.error('Failed to get user:', err)
      }
    }
    fetchUser()
  }, [supabase])

  const loadConversation = useCallback(async (convId: string) => {
    setLoading(true)
    setError(null)
    try {
      const history = await getMessages(convId)
      setMessages(history.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })))
      setConversationId(convId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки истории')
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!assistantId || !userId) return
    setLoading(true)
    setError(null)
    abortControllerRef.current = new AbortController()

    try {
      let currentConversationId = conversationId
      if (!currentConversationId) {
        const conv = await createConversation(assistantId, userId)
        currentConversationId = conv.id
        setConversationId(conv.id)
      }

      if (!currentConversationId) {
        throw new Error('Не удалось создать разговор')
      }

      const userMsg: ChatMessage = { role: 'user', content: userMessage }
      setMessages(prev => [...prev, userMsg])
      await createMessage(currentConversationId, 'user', userMessage)

      const ragContext = await buildRagContext(userMessage, assistantId)
      const systemPrompt = `Ты — AI-помощник. ${ragContext}`

      const currentMessages = messages
      const response = await chatCompletion({
        messages: [...currentMessages, userMsg],
        systemPrompt,
        provider: 'openai',
        model: 'gpt-4o-mini',
      })

      const assistantMsg: ChatMessage = { role: 'assistant', content: response }
      setMessages(prev => [...prev, assistantMsg])
      await createMessage(currentConversationId, 'assistant', response)

      await trackUsage({
        userId,
        assistantId,
        eventType: 'chat_message',
        tokensUsed: Math.ceil((userMessage.length + response.length) / 4),
        metadata: { conversation_id: currentConversationId },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки сообщения')
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [assistantId, userId, conversationId, messages])

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setStreaming(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
  }, [])

  return {
    messages,
    input,
    setInput,
    loading,
    streaming,
    conversationId,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    loadConversation,
  }
}
