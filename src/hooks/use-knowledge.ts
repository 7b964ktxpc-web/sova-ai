'use client'

import { useState, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/database/supabase'
import type { KnowledgeDocument } from '@/types'

export function useKnowledge(assistantId: string | undefined) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchDocuments = useCallback(async () => {
    if (!assistantId) return
    setError(null)
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('assistant_id', assistantId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки документов')
    }
  }, [assistantId, supabase])

  const uploadDocument = useCallback(async (file: File): Promise<KnowledgeDocument> => {
    if (!assistantId) throw new Error('Помощник не выбран')
    setUploading(true)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${assistantId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('knowledge')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const document = await createKnowledgeDocument({
        assistant_id: assistantId,
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        storage_path: filePath,
      })

      setDocuments(prev => [document, ...prev])
      return document
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла')
      throw err
    } finally {
      setUploading(false)
    }
  }, [assistantId, supabase])

  const deleteDocument = useCallback(async (id: string) => {
    setError(null)
    try {
      const { data: doc } = await supabase
        .from('knowledge_documents')
        .select('storage_path')
        .eq('id', id)
        .single()

      if (doc?.storage_path) {
        await supabase.storage.from('knowledge').remove([doc.storage_path])
      }

      const { error } = await supabase.from('knowledge_documents').delete().eq('id', id)
      if (error) throw error
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления документа')
      throw err
    }
  }, [supabase])

  return {
    documents,
    uploading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
  }
}

export async function createKnowledgeDocument(input: {
  assistant_id: string
  user_id: string
  name: string
  type: string
  size?: number
  storage_path?: string
}) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('knowledge_documents')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}
