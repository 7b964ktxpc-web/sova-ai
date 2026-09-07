'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/database/supabase'
import type { Assistant } from '@/types'

export function useAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const fetchedRef = useRef<string | null>(null)

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

  useEffect(() => {
    if (!userId) return

    if (fetchedRef.current === userId) return
    fetchedRef.current = userId

    const fetchAssistants = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('assistants')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (error) throw error
        setAssistants(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки помощников')
      } finally {
        setLoading(false)
      }
    }

    fetchAssistants()
  }, [userId, supabase])

  const createAssistant = useCallback(async (input: { name: string; description?: string; settings?: Record<string, unknown> }) => {
    if (!userId) throw new Error('Не авторизован')
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('assistants')
        .insert({ user_id: userId, ...input })
        .select()
        .single()
      if (error) throw error
      setAssistants(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания помощника')
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const updateAssistant = useCallback(async (id: string, updates: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('assistants')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      setAssistants(prev => prev.map(a => a.id === id ? { ...a, ...data } : a))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления')
      throw err
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const deleteAssistant = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('assistants').delete().eq('id', id)
      if (error) throw error
      setAssistants(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления')
      throw err
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { assistants, loading, error, refetch: () => { fetchedRef.current = null }, createAssistant, updateAssistant, deleteAssistant }
}
