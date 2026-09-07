'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Trash2, Settings, MessageCircle, Database, Sparkles } from 'lucide-react'
import type { Assistant } from '@/types'
import { cn } from '@/lib/utils'

interface AssistantCardProps {
  assistant: Assistant
  onDelete?: () => void
  onClick?: () => void
}

export function AssistantCard({ assistant, onDelete, onClick }: AssistantCardProps) {
  const router = useRouter()

  const handleClick = () => {
    onClick?.()
    router.push(`/assistant/${assistant.id}`)
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer card-premium border-0 shadow-premium overflow-hidden",
        !onClick && "cursor-default"
      )} 
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
              {assistant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-base">{assistant.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{assistant.description || 'Без описания'}</p>
            </div>
          </div>
          <Badge 
            variant={assistant.is_active ? 'default' : 'secondary'}
            className="rounded-full px-3 py-1"
          >
            {assistant.is_active ? 'Активен' : 'Неактивен'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MessageSquare className="h-3 w-3" />
          <span>Создан {new Date(assistant.created_at).toLocaleDateString('ru-RU')}</span>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); router.push(`/assistant/${assistant.id}/chat`) }}>
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); router.push(`/assistant/${assistant.id}/knowledge`) }}>
            <Database className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); router.push(`/assistant/${assistant.id}/settings`) }}>
            <Settings className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-600" onClick={(e) => { e.stopPropagation(); onDelete() }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}