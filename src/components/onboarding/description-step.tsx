'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface DescriptionStepProps {
  data: { description: string; tone: string }
  onUpdate: (updates: Partial<{ description: string; tone: string }>) => void
  onNext: () => void
  onPrev: () => void
}

export function DescriptionStep({ data, onUpdate, onNext, onPrev }: DescriptionStepProps) {
  const tones = [
    { value: 'professional', label: 'Профессиональный' },
    { value: 'friendly', label: 'Дружелюбный' },
    { value: 'casual', label: 'Неформальный' },
    { value: 'formal', label: 'Официальный' },
    { value: 'witty', label: 'Остроумный' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Описание и тон общения</CardTitle>
        <CardDescription>Дополните описание и выберите тон общения</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Детальное описание</label>
          <Textarea placeholder="Опишите подробнее, чем должен заниматься помощник, какие темы он должен знать" value={data.description} onChange={e => onUpdate({ description: e.target.value })} rows={4} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Тон общения</label>
          <div className="flex flex-wrap gap-2">
            {tones.map(tone => (
              <button key={tone.value} type="button" onClick={() => onUpdate({ tone: tone.value })} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${data.tone === tone.value ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                {tone.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>Назад</Button>
          <Button onClick={onNext} disabled={!data.description.trim()}>Далее</Button>
        </div>
      </CardContent>
    </Card>
  )
}
