import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/database/supabase"
import mammoth from "mammoth"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: "Необходимо указать documentId" }, { status: 400 })
    }

    const { data: document, error: docError } = await supabase
      .from("knowledge_documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Документ не найден" }, { status: 404 })
    }

    await supabase
      .from("knowledge_documents")
      .update({ status: "processing" })
      .eq("id", documentId)

    let text = ""

    try {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("knowledge")
        .download(document.storage_path)

      if (downloadError) {
        throw new Error(downloadError.message)
      }

      const buffer = Buffer.from(await fileData.arrayBuffer())

      if (document.type === "pdf") {
        const { parsePdf } = await import('@/lib/knowledge/parser')
        text = await parsePdf(buffer)
      } else if (document.type === "docx" || document.type === "doc") {
        const docxData = await mammoth.extractRawText({ buffer })
        text = docxData.value
      } else if (document.type === "txt" || document.type === "md") {
        text = buffer.toString("utf-8")
      } else {
        throw new Error("Неподдерживаемый формат")
      }
    } catch (err) {
      await supabase
        .from("knowledge_documents")
        .update({
          status: "error",
          error_message: err instanceof Error ? err.message : "Ошибка обработки",
        })
        .eq("id", documentId)

      return NextResponse.json({ error: "Ошибка обработки документа" }, { status: 500 })
    }

    const chunks = chunkText(text, 1000)

    for (const chunk of chunks) {
      await supabase.from("knowledge_chunks").insert({
        document_id: documentId,
        assistant_id: document.assistant_id,
        content: chunk,
        metadata: {},
      })
    }

    await supabase
      .from("knowledge_documents")
      .update({
        status: "ready",
        chunk_count: chunks.length,
        processed_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    return NextResponse.json({ success: true, chunkCount: chunks.length })
  } catch (error) {
    console.error("Knowledge processing error:", error)
    return NextResponse.json({ error: "Произошла ошибка" }, { status: 500 })
  }
}

function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = []
  const words = text.split(/\s+/)

  let currentChunk = ""
  for (const word of words) {
    if ((currentChunk + " " + word).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = word
    } else {
      currentChunk = currentChunk ? currentChunk + " " + word : word
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}
