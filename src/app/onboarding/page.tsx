'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/step-indicator'
import { Card, CardContent } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <OnboardingFlow onComplete={(data) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('sova-onboarding', JSON.stringify(data))
            }
            router.push('/dashboard')
          }} />
        </CardContent>
      </Card>
    </div>
  )
}
