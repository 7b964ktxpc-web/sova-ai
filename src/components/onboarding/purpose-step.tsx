'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface PurposeStepProps {
  data: { purpose: string }
  onUpdate: (updates: { purpose: string }) => void
  onNext: () => void
}

export function PurposeStep({ data, onUpdate, onNext }: PurposeStepProps) {
  const examples = [
    'Поддержка клиентов интернет-магазина',
    'Помощник по подбору туров',
    'FAQ для SaaS продукта',
    'Консультант по юридическим вопросам',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Для чего нужен ваш AI-помощник?</CardTitle>
        <CardDescription>Опишите главную задачу помощника простыми словами</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Опишите назначение</label>
          <Textarea placeholder="Например: помощник поддержки клиентов для интернет-магазина одежды" value={data.purpose} onChange={e => onUpdate({ purpose: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Примеры</label>
          <div className="flex flex-wrap gap-2">
            {examples.map(example => (
              <button key={example} type="button" onClick={() => onUpdate({ purpose: example })} className="text-xs px-3 py-1.5 rounded-full border hover:bg-accent transition-colors">
                {example}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!data.purpose.trim()}>Далее <Sparkles className="ml-2 h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  )
}
