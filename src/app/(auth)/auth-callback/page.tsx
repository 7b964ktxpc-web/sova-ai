"use client"

import { useState, useEffect, Suspense } from "react"
import { createClientComponentClient } from "@/lib/database/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

function AuthCallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code")
        const type = searchParams.get("type")
        const error = searchParams.get("error")

        if (error) {
          setStatus("error")
          const errorDesc = searchParams.get("error_description")
          setMessage(errorDesc || "Ошибка авторизации")
          return
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            setStatus("error")
            setMessage(exchangeError.message)
            return
          }
        }

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          setStatus("error")
          setMessage("Сессия не найдена")
          return
        }

        setStatus("success")
        setMessage(type === "recovery" ? "Пароль успешно сброшен" : "Аккаунт успешно подтверждён")
        setTimeout(() => router.push("/dashboard"), 2000)
      } catch {
        setStatus("error")
        setMessage("Произошла ошибка при обработке")
      }
    }

    handleCallback()
  }, [router, searchParams, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-8">
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Обработка...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Перенаправление...
              </p>
            </div>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
