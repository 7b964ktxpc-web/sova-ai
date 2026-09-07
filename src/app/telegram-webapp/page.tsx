'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/database/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Loader2 } from 'lucide-react'

export default function TelegramWebAppPage() {
  const [user, setUser] = useState<any>(null)
  const [assistants, setAssistants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('assistants')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
        
        if (data) {
          setAssistants(data)
          if (data.length > 0) {
            setSelectedAssistant(data[0])
          }
        }
      }
      
      setLoading(false)
    }
    
    init()
  }, [])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedAssistant || sending) return
    
    const userMessage = { role: 'user', content: message }
    const newHistory = [...chatHistory, userMessage]
    setChatHistory(newHistory)
    setMessage('')
    setSending(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: selectedAssistant.id,
          message: message,
          history: newHistory,
        }),
      })
      
      const data = await response.json()
      
      if (data.response) {
        setChatHistory([...newHistory, { role: 'assistant', content: data.response }])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Вход в Sova AI</CardTitle>
            <CardDescription>
              Войдите в аккаунт для работы с Telegram Web App
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href={`${typeof window !== 'undefined' ? window.location.origin : ''}/login`}>
              <Button className="w-full">Войти</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
            <h1 className="text-lg font-semibold text-gray-900">Sova AI</h1>
          </div>
          {selectedAssistant && (
            <div className="text-sm text-gray-600">
              {selectedAssistant.name}
            </div>
          )}
        </div>
      </div>

      {assistants.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Нет активных помощников</CardTitle>
              <CardDescription>
                Создайте помощника в веб-интерфейсе для начала работы в Telegram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href={`${typeof window !== 'undefined' ? window.location.origin : ''}/assistant/new`}>
                <Button className="w-full">Создать помощника</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Начните диалог с вашим помощником</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Введите сообщение..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                size="sm"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Отправить'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}