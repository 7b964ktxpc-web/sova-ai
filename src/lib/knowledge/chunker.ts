export interface Chunk {
  content: string
  metadata: {
    chunkIndex: number
    startOffset: number
    endOffset: number
    source?: string
  }
}

const DEFAULT_CHUNK_SIZE = 1000
const DEFAULT_CHUNK_OVERLAP = 200

export function chunkText(text: string, options?: { chunkSize?: number; overlap?: number }): Chunk[] {
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE
  const overlap = options?.overlap ?? DEFAULT_CHUNK_OVERLAP

  if (!text || text.trim().length === 0) return []

  const chunks: Chunk[] = []
  const paragraphs = text.split(/\n\s*\n/)
  let currentChunk = ''
  let startOffset = 0
  let chunkIndex = 0

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim()
    if (!paragraph) continue

    const testChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph

    if (testChunk.length <= chunkSize || currentChunk.length === 0) {
      currentChunk = testChunk
    } else {
      const endOffset = startOffset + currentChunk.length
      chunks.push({
        content: currentChunk,
        metadata: { chunkIndex, startOffset, endOffset },
      })
      chunkIndex++

      const overlapText = currentChunk.slice(-overlap)
      startOffset = endOffset - overlap
      currentChunk = overlapText + '\n\n' + paragraph
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: { chunkIndex, startOffset, endOffset: startOffset + currentChunk.length },
    })
  }

  return chunks
}

export function chunkTextBySentences(text: string, maxChunkSize: number = 1000): Chunk[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks: Chunk[] = []
  let currentChunk = ''
  let startOffset = 0
  let chunkIndex = 0

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { chunkIndex, startOffset, endOffset: startOffset + currentChunk.length },
      })
      chunkIndex++
      startOffset += currentChunk.length
      currentChunk = sentence
    } else {
      currentChunk += sentence
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: { chunkIndex, startOffset, endOffset: startOffset + currentChunk.length },
    })
  }

  return chunks
}

export function chunkTextByWords(text: string, wordsPerChunk: number = 200): Chunk[] {
  const words = text.split(/\s+/)
  const chunks: Chunk[] = []
  let startOffset = 0
  let chunkIndex = 0

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunkWords = words.slice(i, i + wordsPerChunk)
    const content = chunkWords.join(' ')
    chunks.push({
      content,
      metadata: { chunkIndex, startOffset, endOffset: startOffset + content.length },
    })
    chunkIndex++
    startOffset += content.length + 1
  }

  return chunks
}
