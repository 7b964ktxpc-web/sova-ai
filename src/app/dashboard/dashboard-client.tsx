"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@/lib/database/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Bot, Plus, Settings, MessageSquare, Activity, Loader2 } from "lucide-react"
import type { Assistant } from "@/types"

export default function DashboardClient({ user }: { user: { id: string } }) {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const { data, error } = await supabase
          .from("assistants")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          setError(error.message)
        } else {
          setAssistants(data || [])
        }
      } catch {
        setError("Произошла ошибка при загрузке помощников")
      } finally {
        setLoading(false)
      }
    }

    fetchAssistants()
  }, [user.id, supabase])

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 hidden md:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SOVA AI</span>
          </Link>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-accent text-accent-foreground"
            >
              <Activity className="h-4 w-4" />
              <span>Мои помощники</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Сообщения</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Настройки</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Мои помощники</h1>
              <p className="text-muted-foreground">
                Управляйте вашими AI-помощниками
              </p>
            </div>
            <Link href="/assistant/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Создать помощника
              </Button>
            </Link>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : assistants.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  У вас пока нет помощников
                </h3>
                <p className="text-muted-foreground mb-6 text-center">
                  Создайте первого помощника — SOVA AI настроит его вместе с вами.
                </p>
                <Link href="/assistant/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Создать помощника
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assistants.map((assistant) => (
                <Card key={assistant.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{assistant.name}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            {assistant.description || "Без описания"}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={assistant.is_active ? "success" : "secondary"}>
                        {assistant.is_active ? "Активен" : "Неактивен"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/assistant/${assistant.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Открыть
                        </Button>
                      </Link>
                      <Link href={`/assistant/${assistant.id}/settings`}>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
