'use client'

import * as React from 'react'
import { useAssistants } from '@/hooks/use-assistants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/progress'
import { Plus, MessageSquare, Sparkles } from 'lucide-react'
import { AssistantCard } from '@/components/assistant/assistant-card'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { OnboardingFlow } from '@/components/onboarding/step-indicator'

export default function DashboardPage() {
  const { assistants, loading, error } = useAssistants()
  const [showOnboarding, setShowOnboarding] = React.useState(false)

  if (showOnboarding) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Создание помощника</h1>
          <p className="text-muted-foreground">Ответьте на несколько вопросов</p>
        </div>
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Дашборд</h1>
          <p className="text-muted-foreground">Управляйте своими AI-помощниками</p>
        </div>
        <Button onClick={() => setShowOnboarding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Создать помощника
        </Button>
      </div>

      <StatsCards assistantsCount={assistants.length} />

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div>
        <h2 className="text-lg font-semibold mb-4">Ваши помощники</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : assistants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Пока нет помощников</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Создайте первого AI-помощника для начала работы</p>
              <Button onClick={() => setShowOnboarding(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Создать помощника
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assistants.map(assistant => (
              <AssistantCard key={assistant.id} assistant={assistant} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
