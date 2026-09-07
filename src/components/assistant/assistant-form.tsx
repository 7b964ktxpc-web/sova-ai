'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Sparkles } from 'lucide-react'
import type { AssistantConfiguration } from '@/types'

const formSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(100),
  description: z.string().max(500).optional(),
})

type FormData = z.infer<typeof formSchema>

interface AssistantFormProps {
  initialData?: Partial<AssistantConfiguration>
  onSubmit: (data: FormData) => Promise<void>
  submitLabel?: string
  onCancel?: () => void
}

export function AssistantForm({ initialData, onSubmit, submitLabel = 'Сохранить', onCancel }: AssistantFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  })

  React.useEffect(() => {
    reset({
      name: initialData?.name || '',
      description: initialData?.description || '',
    })
  }, [initialData, reset])

  const handleFormSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    try {
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Общая информация</CardTitle>
        <CardDescription>Основные настройки помощника</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && <Alert variant="destructive">{error}</Alert>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Имя помощника</label>
            <Input {...register('name')} placeholder="Мой помощник" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Описание</label>
            <Textarea {...register('description')} placeholder="Краткое описание назначения помощника" rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>}
            <Button type="submit" disabled={loading}>
              {loading && <Sparkles className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
