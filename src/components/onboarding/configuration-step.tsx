'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ConfigurationStepProps {
  data: { language: string; tone: string; description: string }
  onUpdate: (updates: Partial<{ language: string; tone: string; description: string }>) => void
  onComplete: () => void
  onPrev: () => void
}

export function ConfigurationStep({ data, onUpdate, onComplete, onPrev }: ConfigurationStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Конфигурация помощника</CardTitle>
        <CardDescription>Проверьте и при необходимости измените параметры</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Язык общения</label>
          <Input value={data.language} onChange={e => onUpdate({ language: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Тон общения</label>
          <Input value={data.tone} onChange={e => onUpdate({ tone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Описание</label>
          <Textarea value={data.description} onChange={e => onUpdate({ description: e.target.value })} rows={4} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Язык: {data.language}</Badge>
          <Badge variant="secondary">Тон: {data.tone}</Badge>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>Назад</Button>
          <Button onClick={onComplete}>Создать помощника</Button>
        </div>
      </CardContent>
    </Card>
  )
}
