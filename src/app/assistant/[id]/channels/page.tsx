"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { createClientComponentClient } from "@/lib/database/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, CheckCircle2, ExternalLink, Bot } from "lucide-react"
import Link from "next/link"
import type { Channel } from "@/types"

export default function ChannelsPage() {
  const params = useParams()
  const assistantId = params.id as string
  const [channels, setChannels] = useState<Channel[]>([])
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [botToken, setBotToken] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const supabase = createClientComponentClient()
  const loadedRef = useRef(false)

  const fetchChannels = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("assistant_id", assistantId)

      if (error) {
        setError(error.message)
      } else {
        setChannels(data || [])
      }
    } catch {
      setError("Произошла ошибка при загрузке каналов")
    }
  }, [assistantId, supabase])

  useEffect(() => {
    if (assistantId && !loadedRef.current) {
      loadedRef.current = true
      fetchChannels()
    }
  }, [assistantId, fetchChannels])

  const handleConnectTelegram = async () => {
    setConnecting(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError("Не авторизован")
        return
      }

      const verificationResponse = await fetch("https://api.telegram.org/bot" + botToken + "/getMe")
      const verificationData = await verificationResponse.json()

      if (!verificationData.ok) {
        setError("Неверный токен бота")
        return
      }

      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`

      const webhookResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`
      )
      const webhookData = await webhookResponse.json()

      if (!webhookData.ok) {
        setError("Не удалось установить webhook")
        return
      }

      const { data: existing } = await supabase
        .from("channels")
        .select("*")
        .eq("assistant_id", assistantId)
        .eq("type", "telegram")
        .single()

      if (existing) {
        await supabase
          .from("channels")
          .update({
            config: {
              ...(existing.config as Record<string, unknown>),
              telegram_bot_token: botToken,
              telegram_chat_id: telegramChatId,
            },
            is_active: true,
          })
          .eq("id", existing.id)
      } else {
        await supabase.from("channels").insert({
          assistant_id: assistantId,
          type: "telegram",
          is_active: true,
          config: {
            telegram_bot_token: botToken,
            telegram_chat_id: telegramChatId,
          },
        })
      }

      setSuccess(true)
      setBotToken("")
      setTelegramChatId("")
      await fetchChannels()
    } catch {
      setError("Произошла ошибка при подключении")
    } finally {
      setConnecting(false)
    }
  }

  const telegramChannel = channels.find(c => c.type === "telegram")

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-muted/30 hidden md:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SOVA AI</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Каналы</h1>
            <p className="text-muted-foreground">
              Подключите каналы для общения с помощником
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-500 text-green-700">
              <AlertDescription>Telegram успешно подключён</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Telegram</CardTitle>
              <CardDescription>
                Подключите Telegram-бота для общения с помощником
              </CardDescription>
            </CardHeader>
            <CardContent>
              {telegramChannel?.is_active ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Статус</h4>
                      <Badge variant="success" className="mt-1">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Подключён
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Открыть бота
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Токен бота
                    </label>
                    <Input
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Получите токен у @BotFather
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ID чата (необязательно)
                    </label>
                    <Input
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="123456789"
                    />
                  </div>
                  <Button
                    onClick={handleConnectTelegram}
                    disabled={connecting || !botToken}
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Подключаем...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Подключить
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Web Chat</CardTitle>
              <CardDescription>
                Встроенный чат для вашего сайта
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="warning" className="mb-2">В разработке</Badge>
                  <p className="text-sm text-muted-foreground">
                    Скоро вы сможете получить ссылку на чат
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
