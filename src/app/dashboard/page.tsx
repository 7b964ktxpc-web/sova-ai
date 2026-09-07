'use client'

import * as React from 'react'
import { useAssistants } from '@/hooks/use-assistants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/progress'
import { Plus, MessageSquare, Sparkles, TrendingUp } from 'lucide-react'
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
          <h1 className="text-3xl font-bold text-gray-900">Создание помощника</h1>
          <p className="text-gray-600 mt-1">Ответьте на несколько вопросов</p>
        </div>
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Дашборд</h1>
          <p className="text-gray-600 mt-1">Управляйте своими AI-помощниками</p>
        </div>
        <Button 
          onClick={() => setShowOnboarding(true)}
          size="lg"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="mr-2 h-5 w-5" />
          Создать помощника
        </Button>
      </div>

      <StatsCards assistantsCount={assistants.length} />

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ваши помощники</h2>
          {assistants.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>{assistants.length} {assistants.length === 1 ? 'помощник' : assistants.length < 5 ? 'помощника' : 'помощников'}</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-gray-200 rounded-lg" /></CardContent></Card>
            ))}
          </div>
        ) : assistants.length === 0 ? (
          <Card className="border-0 shadow-premium-lg">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Пока нет помощников</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Создайте первого AI-помощника для начала работы. Выберите готовый шаблон или создайте уникального помощника.
              </p>
              <Button 
                onClick={() => setShowOnboarding(true)}
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
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