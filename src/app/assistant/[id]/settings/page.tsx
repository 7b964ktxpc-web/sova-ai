'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useAssistants } from '@/hooks/use-assistants'
import { AssistantForm } from '@/components/assistant/assistant-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Loader2, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/database/supabase'
import type { Assistant } from '@/types'

export default function AssistantSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { updateAssistant, deleteAssistant } = useAssistants()
  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAssistant = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('assistants')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
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

    fetchAssistant()
  }, [params.id, router, supabase])

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого помощника?')) return

    try {
      await deleteAssistant(params.id)
      router.push('/dashboard')
    } catch {
      setError('Ошибка удаления')
    }
  }

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

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-muted/30 hidden md:block">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SOVA AI</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Настройки помощника</h1>
              <p className="text-muted-foreground">Настройте поведение и внешний вид</p>
            </div>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">Основные</TabsTrigger>
              <TabsTrigger value="behavior">Поведение</TabsTrigger>
              <TabsTrigger value="advanced">Дополнительно</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Основные настройки</CardTitle>
                  <CardDescription>Имя и описание помощника</CardDescription>
                </CardHeader>
                <CardContent>
                  <AssistantForm
                    initialData={assistant}
                    onSubmit={async (data) => { await updateAssistant(assistant.id, data) }}
                    submitLabel="Сохранить"
                    onCancel={() => router.back()}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior">
              <Card>
                <CardHeader>
                  <CardTitle>Поведение</CardTitle>
                  <CardDescription>Настройте стиль общения</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Настройки поведения будут доступны после создания конфигурации</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Дополнительные настройки</CardTitle>
                  <CardDescription>Расширенные параметры</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Расширенные настройки будут доступны в следующем обновлении</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
