'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/database/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MessageSquare, CheckCircle2, XCircle } from 'lucide-react'

export default function TelegramPage() {
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [botValid, setBotValid] = useState(false)
  const [webAppUrl, setWebAppUrl] = useState('')

  useEffect(() => {
    const url = typeof window !== 'undefined' ? window.location.origin : ''
    setWebAppUrl(url)
  }, [])

  const handleVerifyBot = async () => {
    if (!botToken.trim()) {
      setError('Введите токен бота')
      return
    }

    setVerifying(true)
    setError(null)
    setBotValid(false)

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
      const data = await response.json()

      if (data.ok) {
        setBotValid(true)
        setError(null)
      } else {
        setError('Неверный токен бота')
        setBotValid(false)
      }
    } catch {
      setError('Ошибка проверки токена')
      setBotValid(false)
    } finally {
      setVerifying(false)
    }
  }

  const handleConnect = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setError('Заполните все поля')
      return
    }

    setConnecting(true)
    setError(null)
    setSuccess(false)

    try {
      const webhookUrl = `${webAppUrl}/api/telegram/webhook`
      const webhookResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
      )
      const webhookData = await webhookResponse.json()

      if (!webhookData.ok) {
        setError('Не удалось установить webhook')
        setConnecting(false)
        return
      }

      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Не авторизован')
        setConnecting(false)
        return
      }

      setSuccess(true)
      setConnecting(false)
      setBotToken('')
      setChatId('')
      setBotValid(false)
    } catch {
      setError('Произошла ошибка при подключении')
      setConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Telegram</h1>
              <p className="mt-2 text-gray-600">
                Подключите Telegram-бота для общения с вашим помощником
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Подключение бота</CardTitle>
                  <CardDescription>
                    Введите данные вашего Telegram-бота
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Токен бота
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        placeholder="123456:ABC-DEF..."
                        disabled={connecting || verifying}
                      />
                      <Button
                        variant="outline"
                        onClick={handleVerifyBot}
                        disabled={connecting || verifying || !botToken.trim()}
                      >
                        {verifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Проверить'
                        )}
                      </Button>
                    </div>
                    {botValid && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Токен действителен
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Chat ID
                    </label>
                    <Input
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      placeholder="123456789"
                      disabled={connecting}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Telegram успешно подключён!
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleConnect}
                    disabled={connecting || !botValid}
                    className="w-full"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Подключение...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Подключить
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Telegram Web App</CardTitle>
                  <CardDescription>
                    Инструкция по созданию и настройке
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-gray-600">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">1. Создайте бота</h4>
                      <p>Напишите <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">@BotFather</a> в Telegram и отправьте команду <code className="bg-gray-100 px-1 rounded">/newbot</code></p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">2. Получите токен</h4>
                      <p>BotFather выдаст токен вида <code className="bg-gray-100 px-1 rounded">123456:ABC-DEF...</code></p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">3. Настройте команды</h4>
                      <p>Отправьте <code className="bg-gray-100 px-1 rounded">/setcommands</code> и добавьте:</p>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li><code>start</code> - запуск бота</li>
                        <li><code>help</code> - справка</li>
                        <li><code>assistants</code> - список помощников</li>
                        <li><code>settings</code> - настройки</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">4. Webhook URL</h4>
                      <p className="break-all bg-gray-100 p-2 rounded">{webAppUrl}/api/telegram/webhook</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">5. Получите Chat ID</h4>
                      <p>Напишите боту любое сообщение, затем откройте <code className="bg-gray-100 px-1 rounded">{webAppUrl}/api/telegram/webhook</code> чтобы увидеть chat_id</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">6. Web App</h4>
                      <p>Используйте кнопку Menu Button или команду <code className="bg-gray-100 px-1 rounded">/start</code> для запуска Web App</p>
                    </div>
                    <div className="pt-2">
                      <a href="https://core.telegram.org/bots/webapp" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                        Документация Telegram Web App →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}