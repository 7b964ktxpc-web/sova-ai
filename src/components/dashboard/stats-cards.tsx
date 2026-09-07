'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, FileText, Users, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  assistantsCount?: number
  messagesCount?: number
  documentsCount?: number
  tokensUsed?: number
}

export function StatsCards({ assistantsCount = 0, messagesCount = 0, documentsCount = 0, tokensUsed = 0 }: StatsCardsProps) {
  const stats = [
    { title: 'Помощники', value: assistantsCount.toString(), icon: MessageSquare, color: 'text-blue-500' },
    { title: 'Сообщения', value: messagesCount.toString(), icon: Zap, color: 'text-green-500' },
    { title: 'Документы', value: documentsCount.toString(), icon: FileText, color: 'text-purple-500' },
    { title: 'Токены', value: tokensUsed.toLocaleString('ru-RU'), icon: Users, color: 'text-orange-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
