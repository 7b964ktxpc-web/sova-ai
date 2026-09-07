'use client'

import * as React from 'react'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OnboardingStep } from '@/types'
import { Button } from '@/components/ui/button'

export function StepIndicator({ steps, currentStep }: { steps: OnboardingStep[]; currentStep: number }) {
  if (!steps.length) return null
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                index < currentStep ? "border-indigo-500 bg-indigo-500 text-white" :
                index === currentStep ? "border-indigo-500 text-indigo-600 bg-indigo-50" :
                "border-gray-200 text-gray-400"
              )}>
                {index < currentStep ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn("flex-1 mx-2 h-0.5 transition-all", index < currentStep ? "bg-indigo-500" : "bg-gray-200")} />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-gray-600">{steps[currentStep]?.description}</p>
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
    <div className="max-w-2xl mx-auto w-full animate-fade-in">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-premium-lg p-8">
        <StepIndicator steps={ONBOARDING_STEPS} currentStep={currentStep} />
        <div className="mt-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Для чего тебе нужен помощник?</h2>
                <p className="text-gray-600">Выберите назначение вашего AI-помощника</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Личный помощник', 'Для бизнеса', 'Продажи', 'Поддержка клиентов', 'Telegram-бот', 'Работа с документами', 'Контент', 'Обучение', 'Свой вариант'].map(purpose => (
                  <button
                    key={purpose}
                    type="button"
                    onClick={() => { updateData({ purpose }); nextStep() }}
                    className={`p-4 text-left rounded-xl border-2 transition-all hover:border-indigo-500 hover:shadow-md ${
                      data.purpose === purpose ? "border-indigo-500 bg-indigo-50/50 shadow-md" : "border-gray-200"
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900">{purpose}</h4>
                  </button>
                ))}
              </div>
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Расскажи, что должен делать твой помощник</h2>
                <p className="text-gray-600">Опиши его задачи и стиль общения</p>
              </div>
              <textarea
                value={data.description}
                onChange={e => updateData({ description: e.target.value })}
                placeholder="Например: Отвечай клиентам моего магазина, помогай выбрать товар, рассказывай цены и условия доставки."
                className="w-full min-h-[200px] p-4 rounded-xl border border-gray-200 bg-white text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 resize-none"
              />
              <div className="flex justify-between">
                <Button type="button" onClick={prevStep} variant="outline">Назад</Button>
                <Button type="button" onClick={nextStep}>Далее</Button>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Проверьте конфигурацию</h2>
                <p className="text-gray-600">Убедитесь, что всё правильно</p>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900">Назначение:</h4>
                  <p className="text-sm text-gray-600 mt-1">{data.purpose || 'Не выбрано'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900">Описание:</h4>
                  <p className="text-sm text-gray-600 mt-1">{data.description || 'Не предоставлено'}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button type="button" onClick={prevStep} variant="outline">Назад</Button>
                <Button type="button" onClick={handleComplete} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Завершить
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}