"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@/lib/database/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bot, Loader2, Sparkles, Check } from "lucide-react"

const categories = [
  {
    name: "Для бизнеса",
    prompts: [
      { title: "Магазин одежды", text: "Ты — консультант магазина одежды. Помогай клиентам с выбором товаров, рассказывай про размеры, материалы, цены и условия доставки. Будь вежливым и профессиональным.", icon: "🛍️" },
      { title: "Салон красоты", text: "Ты — консультант салона красоты. Отвечай клиентам на вопросы об услугах, ценах, мастерах и записи. Рекомендуй подходящие процедуры.", icon: "💄" },
      { title: "Маникюрный мастер", text: "Ты — мастер маникюра. Консультируй клиентов по видам маникюра, дизайну, ценам и записи. Рекомендуй подходящие варианты.", icon: "💅" },
      { title: "Парикмахерская", text: "Ты — консультант парикмахерской. Помогай с выбором стрижки, окрашивания, ухода за волосами. Ответь на вопросы об услугах и ценах.", icon: "💇" },
      { title: "Ресторан", text: "Ты — помощник ресторана. Отвечай на вопросы о меню, бронировании, доставке и специальных предложениях. Будь гостеприимным.", icon: "🍽️" },
      { title: "Фитнес клуб", text: "Ты — консультант фитнес-клуба. Рассказывай про абонементы, тренировки, тренеров и расписание. Помогай с выбором программы.", icon: "🏋️" },
    ]
  },
  {
    name: "Для специалистов",
    prompts: [
      { title: "Фрилансер", text: "Ты — личный ассистент фрилансера. Управляй задачами, сроками, клиентами. Помогай с коммерческими предложениями и счетами.", icon: "💼" },
      { title: "Риелтор", text: "Ты — ассистент риелтора. Помогай с подбором недвижимости, оформлением документов и консультациями по рынку.", icon: "🏠" },
      { title: "Врач", text: "Ты — ассистент врача. Отвечай на вопросы пациентов о записи, услугах, анализах. Напоминай о приеме.", icon: "⚕️" },
      { title: "Юрист", text: "Ты — ассистент юриста. Консультируй по юридическим вопросам, договорам, консультациям и срокам.", icon: "⚖️" },
    ]
  },
  {
    name: "Личное",
    prompts: [
      { title: "Личный помощник", text: "Ты — личный ассистент. Управляй задачами, напоминаниями, планами. Помогай с организацией и отвечай на вопросы.", icon: "⭐" },
      { title: "Обучение", text: "Ты — репетитор. Объясняй темы простым языком, проверяй задания, давай обратную связь. Адаптируйся под уровень ученика.", icon: "📚" },
      { title: "Путешествия", text: "Ты — помощник для путешествий. Планируй маршруты, подбирай отели и транспорт, давай советы по странам.", icon: "✈️" },
      { title: "Кулинария", text: "Ты — кулинарный ассистент. Предлагай рецепты, советы по готовке, планируй меню и списки покупок.", icon: "🍳" },
    ]
  }
]

export default function NewAssistantPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handlePromptSelect = (text: string, title: string) => {
    setDescription(text)
    setSelectedPrompt(title)
    if (!name) {
      setName(title)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: assistant, error } = await supabase
        .from("assistants")
        .insert({
          user_id: user.id,
          name: name || "Мой помощник",
          description: description || "",
          settings: {
            is_onboarded: false,
            category: selectedCategory,
          },
        })
        .select()
        .single()

      if (error) {
        setError(error.message)
        return
      }

      router.push(`/assistant/${assistant.id}`)
    } catch {
      setError("Произошла ошибка при создании помощника")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Создать помощника</h1>
          <p className="text-lg text-gray-600">
            Выберите готовый шаблон или создайте уникального помощника
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Основная информация</CardTitle>
              <CardDescription>
                Дайте имя и описание вашему помощнику
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-3">
                  Как назвать помощника?
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: «Помощник магазина», «Моя Сова»"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold mb-3">
                  Что он должен делать?
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите задачу. Например: «Помогай клиентам выбирать товары и отвечай на вопросы о доставке»."
                  className="min-h-[140px] text-base resize-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Не нужно писать технические инструкции — Sova AI сам превратит ваше описание в настройки.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Или выберите готовый шаблон</h2>
            <p className="text-gray-600 mb-6">
              Нажмите на шаблон, чтобы автоматически заполнить название и описание
            </p>

            <div className="space-y-8">
              {categories.map((category) => (
                <div key={category.name}>
                  <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.prompts.map((prompt) => (
                      <button
                        key={prompt.title}
                        type="button"
                        onClick={() => handlePromptSelect(prompt.text, prompt.title)}
                        className={`p-5 text-left rounded-2xl border-2 transition-all hover:border-indigo-500 hover:shadow-md ${
                          selectedPrompt === prompt.title
                            ? "border-indigo-500 bg-indigo-50/50 shadow-md"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{prompt.icon}</span>
                          {selectedPrompt === prompt.title && (
                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold mb-2">{prompt.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {prompt.text}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard">
              <Button type="button" variant="outline" size="lg">
                Отмена
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading || !description.trim()}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Создаём...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-5 w-5" />
                  Создать помощника
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}