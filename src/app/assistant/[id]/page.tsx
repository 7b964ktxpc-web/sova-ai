'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/database/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageSquare, Database, Settings, Loader2, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChatInterface } from '@/components/chat/chat-interface'
import { KnowledgeUpload } from '@/components/knowledge/knowledge-upload'
import { KnowledgeList } from '@/components/knowledge/knowledge-list'
import { AssistantForm } from '@/components/assistant/assistant-form'
import type { Assistant, KnowledgeDocument } from '@/types'

export default function AssistantPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          setUserId(data.user.id)
        }
      } catch (err) {
        console.error('Failed to get user:', err)
      }
    }
    fetchUser()
  }, [supabase])

  useEffect(() => {
    const fetchAssistant = async () => {
      if (!userId) return
      try {
        const { data, error } = await supabase
          .from('assistants')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', userId)
          .single()

        if (error || !data) {
          setError('Помощник не найден')
        } else {
          setAssistant(data)
        }
      } catch {
        setError('Произошла ошибка при загрузке')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchAssistant()
    }
  }, [userId, params.id, supabase])

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!params.id) return
      try {
        const { data, error } = await supabase
          .from('knowledge_documents')
          .select('*')
          .eq('assistant_id', params.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to fetch documents:', error)
        } else {
          setDocuments(data || [])
        }
      } catch {
        console.error('Failed to fetch documents')
      }
    }

    fetchDocuments()
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error || !assistant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{error || 'Помощник не найден'}</h2>
          <Button onClick={() => router.push('/dashboard')}>Вернуться в Dashboard</Button>
        </div>
      </div>
    )
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('id', documentId)
        .eq('assistant_id', assistant.id)

      if (error) {
        setError(error.message)
      } else {
        setDocuments(prev => prev.filter(d => d.id !== documentId))
      }
    } catch {
      setError('Произошла ошибка при удалении')
    }
  }

  const handleUpdateAssistant = async (updates: Partial<Assistant>) => {
    try {
      const { data, error } = await supabase
        .from('assistants')
        .update(updates)
        .eq('id', assistant.id)
        .select()
        .single()

      if (error) {
        setError(error.message)
      } else {
        setAssistant(data)
      }
    } catch {
      setError('Произошла ошибка при сохранении')
    }
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-muted/30 hidden md:block">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SOVA AI</span>
          </div>
          <nav className="space-y-2">
            <Link
              href={`/assistant/${assistant.id}`}
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-accent text-accent-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Обзор</span>
            </Link>
            <Link
              href={`/assistant/${assistant.id}/settings`}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Настройки</span>
            </Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{assistant.name}</h1>
              <p className="text-muted-foreground">{assistant.description || 'Без описания'}</p>
            </div>
            <Badge variant={assistant.is_active ? 'success' : 'secondary'}>
              {assistant.is_active ? 'Активен' : 'Неактивен'}
            </Badge>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-2" />Чат</TabsTrigger>
              <TabsTrigger value="knowledge"><Database className="h-4 w-4 mr-2" />Знания</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Настройки</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="h-[calc(100vh-200px)]">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  {userId ? (
                    <ChatInterface assistantId={assistant.id} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Требуется авторизация</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="knowledge" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>База знаний</CardTitle>
                  <CardDescription>Загрузите документы для обучения помощника</CardDescription>
                </CardHeader>
                <CardContent>
                  <KnowledgeUpload assistantId={assistant.id} onUploadComplete={() => {}} />
                </CardContent>
              </Card>
              <div>
                <h3 className="text-lg font-semibold mb-4">Загруженные документы</h3>
                <KnowledgeList documents={documents} onDelete={handleDeleteDocument} />
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <AssistantForm
                initialData={assistant}
                onSubmit={handleUpdateAssistant}
                submitLabel="Сохранить"
                onCancel={() => router.back()}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
