'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Trash2, Settings, MessageCircle, Database } from 'lucide-react'
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
    <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", !onClick && "cursor-default")} onClick={handleClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {assistant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{assistant.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{assistant.description || 'Без описания'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={assistant.is_active ? 'success' : 'secondary'}>
              {assistant.is_active ? 'Активен' : 'Неактивен'}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span>Создан {new Date(assistant.created_at).toLocaleDateString('ru-RU')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); router.push(`/assistant/${assistant.id}/chat`) }}>
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); router.push(`/assistant/${assistant.id}/knowledge`) }}>
            <Database className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); router.push(`/assistant/${assistant.id}/settings`) }}>
            <Settings className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete() }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
