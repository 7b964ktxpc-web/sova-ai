import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/database/supabase"
import { withRateLimit } from "@/lib/security/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const rateLimit = await withRateLimit(request, 'assistants')
    if (!rateLimit.allowed) {
      const response = NextResponse.json({ error: "Слишком много запросов" }, { status: 429 })
      response.headers.set('Retry-After', Math.ceil((rateLimit.result!.resetAt - Date.now()) / 1000).toString())
      return response
    }

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

    const { data: assistants } = await supabase
      .from("assistants")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    const response = NextResponse.json(assistants || [])
    if (rateLimit.result) {
      response.headers.set('X-RateLimit-Remaining', rateLimit.result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(rateLimit.result.resetAt).toISOString())
    }
    return response
  } catch {
    return NextResponse.json({ error: "Произошла ошибка" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await withRateLimit(request, 'assistants')
    if (!rateLimit.allowed) {
      const response = NextResponse.json({ error: "Слишком много запросов" }, { status: 429 })
      response.headers.set('Retry-After', Math.ceil((rateLimit.result!.resetAt - Date.now()) / 1000).toString())
      return response
    }

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

    const { name, description, settings } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Необходимо указать имя" }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: "Имя слишком длинное (максимум 100 символов)" }, { status: 400 })
    }

    const { data: assistant } = await supabase
      .from("assistants")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: (description || "").trim(),
        settings: settings || {},
      })
      .select()
      .single()

    const response = NextResponse.json(assistant, { status: 201 })
    if (rateLimit.result) {
      response.headers.set('X-RateLimit-Remaining', rateLimit.result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(rateLimit.result.resetAt).toISOString())
    }
    return response
  } catch {
    return NextResponse.json({ error: "Произошла ошибка" }, { status: 500 })
  }
}
