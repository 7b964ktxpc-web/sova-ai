import mammoth from 'mammoth'

export async function parseDocument(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const mimeType = file.type || 'text/plain'

  if (mimeType === 'application/pdf') {
    return parsePdf(buffer)
  }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
    return parseDocx(buffer)
  }
  if (mimeType === 'text/plain' || file.name.endsWith('.txt')) {
    return buffer.toString('utf-8')
  }
  if (mimeType === 'text/html' || file.name.endsWith('.html')) {
    return buffer.toString('utf-8').replace(/<[^>]*>/g, ' ')
  }
  if (mimeType === 'text/markdown' || file.name.endsWith('.md')) {
    return buffer.toString('utf-8')
  }

  throw new Error(`Неподдерживаемый формат файла: ${mimeType || file.name}`)
}

export async function parsePdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse(buffer)
  const result = await parser.getText()
  if (typeof result === 'string') {
    return result
  }
  if (result && typeof result.text === 'string') {
    return result.text
  }
  return JSON.stringify(result)
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export async function parseUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'SOVA-AI-Bot/1.0' },
    signal: AbortSignal.timeout(30000),
  })
  if (!response.ok) throw new Error(`Не удалось загрузить URL: ${response.statusText}`)
  const html = await response.text()
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function parseText(text: string): Promise<string> {
  return text.trim()
}

export function getDocumentType(file: File): string {
  const mimeType = file.type
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (mimeType === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') return 'docx'
  if (mimeType === 'text/plain' || ext === 'txt') return 'txt'
  if (mimeType === 'text/html' || ext === 'html') return 'html'
  if (mimeType === 'text/markdown' || ext === 'md') return 'md'
  return 'unknown'
}
