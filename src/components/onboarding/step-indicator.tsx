'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OnboardingStep } from '@/types'

export function StepIndicator({ steps, currentStep }: { steps: OnboardingStep[]; currentStep: number }) {
  if (!steps.length) return null
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
                index < currentStep ? "border-primary bg-primary text-primary-foreground" :
                index === currentStep ? "border-primary text-primary" :
                "border-muted-foreground/25 text-muted-foreground/50"
              )}>
                {index < currentStep ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <span className="mt-2 text-xs font-medium">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn("flex-1 mx-2 h-0.5", index < currentStep ? "bg-primary" : "bg-muted")} />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">{steps[currentStep]?.description}</p>
    </div>
  )
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, title: 'Назначение', description: 'Опишите для чего нужен помощник', completed: false },
  { id: 2, title: 'Описание', description: 'Дополните описание и тон общения', completed: false },
  { id: 3, title: 'Конфигурация', description: 'Проверьте и настройте параметры', completed: false },
]

interface OnboardingFlowProps {
  onComplete?: (data: { purpose: string; description: string; tone: string; language: string }) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [data, setData] = React.useState({ purpose: '', description: '', tone: 'professional', language: 'ru' })

  const updateData = (updates: Partial<typeof data>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    ONBOARDING_STEPS.forEach(s => s.completed = true)
    onComplete?.(data)
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <StepIndicator steps={ONBOARDING_STEPS} currentStep={currentStep} />
      <div className="mt-8">
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Для чего тебе нужен помощник?</h2>
            <p className="text-sm text-muted-foreground">Выберите назначение вашего AI-помощника</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Личный помощник', 'Для бизнеса', 'Продажи', 'Поддержка клиентов', 'Telegram-бот', 'Работа с документами', 'Контент', 'Обучение', 'Свой вариант'].map(purpose => (
                <button
                  key={purpose}
                  type="button"
                  onClick={() => { updateData({ purpose }); nextStep() }}
                  className={`p-4 text-left rounded-lg border-2 transition-all hover:border-primary ${data.purpose === purpose ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <h4 className="font-semibold">{purpose}</h4>
                </button>
              ))}
            </div>
          </div>
        )}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Расскажи, что должен делать твой помощник</h2>
            <textarea
              value={data.description}
              onChange={e => updateData({ description: e.target.value })}
              placeholder="Например: Отвечай клиентам моего магазина, помогай выбрать товар, рассказывай цены и условия доставки."
              className="w-full min-h-[200px] p-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="px-4 py-2 rounded-md border">Назад</button>
              <button type="button" onClick={nextStep} className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Далее</button>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Проверьте конфигурацию</h2>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">Назначение:</h4>
                <p className="text-sm text-muted-foreground">{data.purpose || 'Не выбрано'}</p>
              </div>
              <div>
                <h4 className="font-medium">Описание:</h4>
                <p className="text-sm text-muted-foreground">{data.description || 'Не предоставлено'}</p>
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="px-4 py-2 rounded-md border">Назад</button>
              <button type="button" onClick={handleComplete} className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Завершить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
