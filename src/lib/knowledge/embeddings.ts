import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    })

    return result.embedding as number[]
  } catch (error) {
    console.error("Embedding error:", error)
    throw error
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const results: number[][] = []
    for (const text of texts) {
      const result = await generateEmbedding(text)
      results.push(result)
    }
    return results
  } catch (error) {
    console.error("Embeddings error:", error)
    throw error
  }
}
