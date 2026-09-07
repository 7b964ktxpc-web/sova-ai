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
import { Bot, Loader2 } from "lucide-react"

const examples = [
  { title: "Помощник для магазина", text: "Отвечай клиентам моего магазина одежды, помогай выбрать товар, рассказывай про размеры, цены и условия доставки." },
  { title: "Помощник для салона красоты", text: "Я консультант салона красоты. Отвечай клиентам на вопросы об услугах, ценах и записи." },
  { title: "Помощник для автосервиса", text: "Я помощник автосервиса. Отвечай клиентам на вопросы об услугах, ценах и записи." },
  { title: "Помощник для ресторана", text: "Я помощник ресторана. Отвечай на вопросы о меню, бронировании и доставке." },
  { title: "Личный помощник", text: "Я личный помощник. Помогай организовывать задачи, напоминания и отвечай на вопросы." },
  { title: "Помощник по продажам", text: "Я помощник отдела продаж. Помогай клиентам с выбором товара, оформлением заказа и отвечай на вопросы." },
]

export default function NewAssistantPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedExample, setSelectedExample] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleExampleClick = (text: string) => {
    setDescription(text)
    setSelectedExample(text)
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Создать помощника</h1>
            <p className="text-muted-foreground">
              Опишите, какого помощника вы хотите создать
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  Дайте имя и описание вашему помощнику
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Как назвать помощника?
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: «Помощник магазина», «Моя Сова»"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Что он должен делать?
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Опишите задачу своими словами. Например: «Помогай клиентам выбирать товары и отвечай на вопросы о доставке»."
                    className="min-h-[120px]"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Не нужно писать технические инструкции — SOVA AI сам превратит ваше описание в настройки.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Или выбери готовый пример</CardTitle>
                <CardDescription>
                  Нажмите на пример, чтобы автоматически заполнить поле описания
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {examples.map((example) => (
                    <button
                      key={example.title}
                      type="button"
                      onClick={() => handleExampleClick(example.text)}
                      className={`p-4 text-left rounded-lg border-2 transition-all hover:border-primary ${
                        selectedExample === example.text
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <h4 className="font-semibold mb-1">{example.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {example.text}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Отмена
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !description.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создаём...
                  </>
                ) : (
                  "Создать моего помощника"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
