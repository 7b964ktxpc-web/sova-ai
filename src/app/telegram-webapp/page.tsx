'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/database/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Loader2, Sparkles, Send, Bot, User } from 'lucide-react'

export default function TelegramWebAppPage() {
  const [user, setUser] = useState<any>(null)
  const [assistants, setAssistants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [sending, setSending] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
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
  }, [mounted])

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
      setChatHistory([...newHistory, { role: 'assistant', content: 'Произошла ошибка. Попробуйте позже.' }])
    } finally {
      setSending(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl mx-auto animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-600 font-medium">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Sova AI</CardTitle>
            <CardDescription>
              Войдите в аккаунт для работы с Telegram Web App
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href={`${typeof window !== 'undefined' ? window.location.origin : ''}/login`}>
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                Войти в аккаунт
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Sova AI</h1>
              {selectedAssistant && (
                <p className="text-xs text-gray-500">{selectedAssistant.name}</p>
              )}
            </div>
          </div>
          {selectedAssistant && (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Активен</span>
            </div>
          )}
        </div>
      </div>

      {assistants.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Нет активных помощников</CardTitle>
              <CardDescription>
                Создайте помощника в веб-интерфейсе для начала работы в Telegram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href={`${typeof window !== 'undefined' ? window.location.origin : ''}/assistant/new`}>
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  Создать помощника
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 ? (
              <div className="text-center mt-12 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-4 flex items-center justify-center opacity-80">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-600 font-medium mb-1">Начните диалог</p>
                <p className="text-sm text-gray-400">Ваш помощник готов помочь</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-200/50 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-white text-gray-900 border border-gray-200/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 px-4 py-3 sticky bottom-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Введите сообщение..."
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                size="sm"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl px-4 shadow-lg hover:shadow-xl transition-all"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}