import { createClientComponentClient } from '@/lib/database/supabase'
import { generateEmbedding } from './embeddings'

export interface SearchResult {
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export async function searchSimilarChunks(query: string, assistantId: string, limit: number = 5): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query)

  const supabase = createClientComponentClient()
  const { data, error } = await supabase.rpc('search_knowledge_chunks', {
    query_embedding: embedding,
    assistant_id: assistantId,
    match_limit: limit,
  })

  if (error) {
    throw new Error(`Ошибка поиска: ${error.message}`)
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    content: item.content as string,
    metadata: item.metadata as Record<string, unknown>,
    similarity: item.similarity as number,
  }))
}

export async function searchSimilarChunksInDocument(query: string, documentId: string, limit: number = 5): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query)

  const supabase = createClientComponentClient()
  const { data, error } = await supabase.rpc('search_knowledge_chunks_by_document', {
    query_embedding: embedding,
    document_id: documentId,
    match_limit: limit,
  })

  if (error) {
    throw new Error(`Ошибка поиска: ${error.message}`)
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    content: item.content as string,
    metadata: item.metadata as Record<string, unknown>,
    similarity: item.similarity as number,
  }))
}

export async function buildRagContext(query: string, assistantId: string, maxChunks: number = 5): Promise<string> {
  const results = await searchSimilarChunks(query, assistantId, maxChunks)

  if (results.length === 0) return ''

  const context = results
    .map((result, index) => `[${index + 1}] ${result.content}`)
    .join('\n\n')

  return `Используй следующую информацию для ответа:\n\n${context}\n\nЕсли информации недостаточно, сообщи об этом пользователю.`
}

export async function buildRagContextWithSources(query: string, assistantId: string, maxChunks: number = 5): Promise<{ context: string; sources: Array<{ content: string; metadata: Record<string, unknown>; similarity: number }> }> {
  const results = await searchSimilarChunks(query, assistantId, maxChunks)

  if (results.length === 0) {
    return { context: '', sources: [] }
  }

  const context = results
    .map((result, index) => `[${index + 1}] ${result.content}`)
    .join('\n\n')

  return {
    context: `Используй следующую информацию для ответа:\n\n${context}\n\nЕсли информации недостаточно, сообщи об этом пользователю.`,
    sources: results.map(r => ({ content: r.content, metadata: r.metadata, similarity: r.similarity })),
  }
}
