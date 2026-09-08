'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useAssistants } from '@/hooks/use-assistants'
import { AssistantForm } from '@/components/assistant/assistant-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Trash2, Loader2, Bot, Settings, MessageSquare, Sliders, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/database/supabase'
import type { Assistant } from '@/types'

const aiProviders = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)' },
      { id: 'inclusionai/ling-3.0-flash-sante:free', name: 'Ling 3.0 Flash Sante (Free)' },
      { id: 'inclusionai/ling-3.0-flash-fin:free', name: 'Ling 3.0 Flash Fin (Free)' },
      { id: 'liquid/lfm-2.5-embedding-350m:free', name: 'LFM 2.5 Embedding 350M (Free)' },
      { id: 'dots-studio/dots-3-note-preview:free', name: 'Dots 3 Note Preview (Free)' },
      { id: 'deepgram/flux-tts:free', name: 'Deepgram Flux TTS (Free)' },
      { id: 'liquid/lfm-2.5-2.6b:free', name: 'LFM 2.5 2.6B (Free)' },
      { id: 'nvidia/nemotron-3.5-lightning:free', name: 'Nemotron 3.5 Lightning (Free)' },
      { id: 'thinkingmachines/inkling-small:free', name: 'Inkling Small (Free)' },
      { id: 'fish-audio/s2.1-pro-free:free', name: 'Fish Audio S2.1 Pro (Free)' },
      { id: 'poolside/laguna-s-2.1:free', name: 'Poolside Laguna S 2.1 (Free)' },
      { id: 'thinkingmachines/inkling:free', name: 'Inkling (Free)' },
      { id: 'nvidia/nemotron-3-embed-1b:free', name: 'Nemotron 3 Embed 1B (Free)' },
      { id: 'poolside/laguna-xs-2.1:free', name: 'Poolside Laguna XS 2.1 (Free)' },
      { id: 'cohere/north-mini-code:free', name: 'Cohere North Mini Code (Free)' },
      { id: 'nvidia/llama-nemotron-rerank-vl-1b-v2:free', name: 'Llama Nemotron Rerank (Free)' },
      { id: 'nvidia/nemotron-3.5-content-safety:free', name: 'Nemotron 3.5 Content Safety (Free)' },
      { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nemotron 3 Ultra 550B (Free)' },
      { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', name: 'Nemotron 3 Nano Omni (Free)' },
      { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B A4B IT (Free)' },
      { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B IT (Free)' },
      { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B (Free)' },
      { id: 'nvidia/llama-nemotron-embed-vl-1b-v2:free', name: 'Llama Nemotron Embed VL (Free)' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    models: [
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    ],
  },
]

export default function AssistantSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { updateAssistant, deleteAssistant } = useAssistants()
  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const [provider, setProvider] = useState('openrouter')
  const [model, setModel] = useState('meta-llama/llama-3.1-8b-instruct:free')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)

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

  const handleSaveSettings = async () => {
    if (!assistant) return
    
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from('assistants')
        .update({
          settings: {
            ...assistant.settings,
            provider,
            model,
            temperature,
            max_tokens: maxTokens,
          }
        })
        .eq('id', assistant.id)

      if (error) throw error

      setSuccess('Настройки сохранены')
      setAssistant({
        ...assistant,
        settings: {
          ...assistant.settings,
          provider,
          model,
          temperature,
          max_tokens: maxTokens,
        }
      })
    } catch {
      setError('Ошибка сохранения настроек')
    } finally {
      setSaving(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Настройки помощника</h1>
            <p className="text-gray-600">Настройте поведение, модель и внешний вид</p>
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

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Основные
            </TabsTrigger>
            <TabsTrigger value="model" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Модель
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Поведение
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="border-0 shadow-premium">
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

          <TabsContent value="model">
            <Card className="border-0 shadow-premium">
              <CardHeader>
                <CardTitle>Модель ИИ</CardTitle>
                <CardDescription>Выберите провайдера и модель для ответов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Провайдер</p>
                  <select
                    value={provider}
                    onChange={(e) => {
                      setProvider(e.target.value)
                      const providerData = aiProviders.find(p => p.id === e.target.value)
                      if (providerData?.models.length) {
                        setModel(providerData.models[0].id)
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {aiProviders.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Модель</p>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {aiProviders.find(p => p.id === provider)?.models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    {model.includes(':free') ? 'Бесплатная модель' : 'Платная модель'}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Температура: {temperature}</p>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Точный</span>
                    <span>Сбалансированный</span>
                    <span>Креативный</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Максимум токенов: {maxTokens}</p>
                  <input
                    type="range"
                    min="256"
                    max="4096"
                    step="256"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>256</span>
                    <span>4096</span>
                  </div>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Сохранить настройки
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior">
            <Card className="border-0 shadow-premium">
              <CardHeader>
                <CardTitle>Поведение</CardTitle>
                <CardDescription>Настройте стиль общения помощника</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Настройки поведения будут доступны после создания конфигурации</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}