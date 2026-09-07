import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/database/supabase'
import { getKnowledgeDocuments, createKnowledgeDocument, deleteKnowledgeDocument } from '@/lib/database/queries'
import { validateFileType, validateFileSize, sanitizeInput } from '@/lib/security/validation'
import { parseDocument, getDocumentType } from '@/lib/knowledge/parser'
import { chunkText } from '@/lib/knowledge/chunker'
import { generateEmbeddings } from '@/lib/knowledge/embeddings'
import { withRateLimit } from '@/lib/security/rate-limit'

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'pdf': ['application/pdf'],
  'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'doc': ['application/msword'],
  'txt': ['text/plain', 'text/x-pascal'],
  'md': ['text/markdown', 'text/plain'],
  'html': ['text/html', 'application/xhtml+xml'],
}

async function requireAuth(request: NextRequest) {
  const supabase = createServiceRoleClient()
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return { user: null, error: 'Не авторизован', status: 401 as const, supabase }
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return { user: null, error: 'Не авторизован', status: 401 as const, supabase }
  }

  return { user: data.user, error: null, status: 200 as const, supabase }
}

async function verifyAssistantOwnership(supabase: ReturnType<typeof createServiceRoleClient>, assistantId: string, userId: string) {
  const { data, error } = await supabase
    .from('assistants')
    .select('id')
    .eq('id', assistantId)
    .eq('user_id', userId)
    .single()

  return !!data && !error
}

async function verifyDocumentOwnership(supabase: ReturnType<typeof createServiceRoleClient>, documentId: string, userId: string) {
  const { data, error } = await supabase
    .from('knowledge_documents')
    .select('id, assistant_id')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single()

  return !!data && !error
}

function validateMimeType(file: File, expectedType: string): { valid: boolean; message?: string } {
  const allowedMimes = ALLOWED_MIME_TYPES[expectedType] || []
  if (allowedMimes.length > 0 && !allowedMimes.includes(file.type)) {
    return {
      valid: false,
      message: `Некорректный MIME-тип файла. Ожидается: ${expectedType}, получен: ${file.type || 'неизвестно'}`,
    }
  }

  const header = file.type || ''
  if (!header.startsWith('application/') && !header.startsWith('text/') && !header.startsWith('image/')) {
    return {
      valid: false,
      message: 'Подозрительный MIME-тип файла',
    }
  }

  return { valid: true }
}

export async function GET(request: NextRequest) {
  const rateLimit = await withRateLimit(request, 'knowledge')
  if (!rateLimit.allowed) {
    const response = NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 })
    response.headers.set('Retry-After', Math.ceil((rateLimit.result!.resetAt - Date.now()) / 1000).toString())
    return response
  }

  const { user, error, status, supabase } = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error }, { status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const assistantId = sanitizeInput(searchParams.get('assistantId') || '')
    const documentId = sanitizeInput(searchParams.get('documentId') || '')

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId обязателен' }, { status: 400 })
    }

    if (documentId) {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('id', documentId)
        .eq('assistant_id', assistantId)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Документ не найден' }, { status: 404 })
      }

      return NextResponse.json(data)
    }

    const ownsAssistant = await verifyAssistantOwnership(supabase, assistantId, user.id)
    if (!ownsAssistant) {
      return NextResponse.json({ error: 'Нет доступа к ассистенту' }, { status: 403 })
    }

    const documents = await getKnowledgeDocuments(assistantId)
    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ошибка' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = await withRateLimit(request, 'knowledge')
  if (!rateLimit.allowed) {
    const response = NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 })
    response.headers.set('Retry-After', Math.ceil((rateLimit.result!.resetAt - Date.now()) / 1000).toString())
    return response
  }

  const { user, error, status, supabase } = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error }, { status })
  }

  try {
    const formData = await request.formData()
    const assistantId = sanitizeInput(formData.get('assistantId') as string)
    const file = formData.get('file') as File | null
    const url = formData.get('url') as string | null

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId обязателен' }, { status: 400 })
    }

    const ownsAssistant = await verifyAssistantOwnership(supabase, assistantId, user.id)
    if (!ownsAssistant) {
      return NextResponse.json({ error: 'Нет доступа к ассистенту' }, { status: 403 })
    }

    if (file) {
      const fileType = getDocumentType(file)
      const typeValidation = validateFileType(file, ['pdf', 'docx', 'txt', 'md', 'html'])
      if (!typeValidation.valid) {
        return NextResponse.json({ error: typeValidation.message }, { status: 400 })
      }

      const mimeValidation = validateMimeType(file, fileType)
      if (!mimeValidation.valid) {
        return NextResponse.json({ error: mimeValidation.message }, { status: 400 })
      }

      const sizeValidation = validateFileSize(file, 10)
      if (!sizeValidation.valid) {
        return NextResponse.json({ error: sizeValidation.message }, { status: 400 })
      }

      const document = await createKnowledgeDocument({
        assistant_id: assistantId,
        user_id: user.id,
        name: file.name,
        type: fileType,
        size: file.size,
      })

      processKnowledgeDocument(document.id, assistantId, file)
      return NextResponse.json(document, { status: 201 })
    }

    if (url) {
      const sanitizedUrl = sanitizeInput(url)
      try {
        new URL(sanitizedUrl)
      } catch {
        return NextResponse.json({ error: 'Некорректный URL' }, { status: 400 })
      }

      if (!sanitizedUrl.startsWith('https://') && !sanitizedUrl.startsWith('http://')) {
        return NextResponse.json({ error: 'URL должен начинаться с http:// или https://' }, { status: 400 })
      }

      const document = await createKnowledgeDocument({
        assistant_id: assistantId,
        user_id: user.id,
        name: new URL(sanitizedUrl).hostname,
        type: 'url',
      })

      return NextResponse.json(document, { status: 201 })
    }

    return NextResponse.json({ error: 'Файл или URL обязательны' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ошибка загрузки' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const rateLimit = await withRateLimit(request, 'knowledge')
  if (!rateLimit.allowed) {
    const response = NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 })
    response.headers.set('Retry-After', Math.ceil((rateLimit.result!.resetAt - Date.now()) / 1000).toString())
    return response
  }

  const { user, error, status, supabase } = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error }, { status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const documentId = sanitizeInput(searchParams.get('documentId') || '')

    if (!documentId) {
      return NextResponse.json({ error: 'documentId обязателен' }, { status: 400 })
    }

    const doc = await verifyDocumentOwnership(supabase, documentId, user.id)
    if (!doc) {
      return NextResponse.json({ error: 'Документ не найден или нет доступа' }, { status: 404 })
    }

    await deleteKnowledgeDocument(documentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ошибка удаления' }, { status: 500 })
  }
}

async function processKnowledgeDocument(documentId: string, assistantId: string, file: File) {
  try {
    const supabase = createServiceRoleClient()
    await supabase
      .from('knowledge_documents')
      .update({ status: 'processing' })
      .eq('id', documentId)

    const text = await parseDocument(file)
    const chunks = chunkText(text)

    await generateEmbeddings(chunks.map(c => c.content))

    await supabase
      .from('knowledge_documents')
      .update({ status: 'ready', chunk_count: chunks.length, processed_at: new Date().toISOString() })
      .eq('id', documentId)
  } catch (error) {
    const supabase = createServiceRoleClient()
    await supabase
      .from('knowledge_documents')
      .update({ status: 'error', error_message: error instanceof Error ? error.message : 'Неизвестная ошибка' })
      .eq('id', documentId)
  }
}
