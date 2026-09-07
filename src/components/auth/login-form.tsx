'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/database/supabase'
import { signIn } from '@/lib/auth/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Loader2, MessageSquare } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClientComponentClient> | null>(null)

  React.useState(() => {
    try {
      setSupabase(createClientComponentClient())
    } catch {
      setError('Сервис временно недоступен')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  const handleTelegramSignIn = () => {
    const botUsername = 'SovaAIHelperBot'
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const telegramUrl = `https://t.me/${botUsername}?start=login&origin=${encodeURIComponent(origin)}`
    window.location.href = telegramUrl
  }

  if (!supabase) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Пароль</label>
        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Войти
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">или</span></div>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={handleTelegramSignIn} disabled={loading}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Войти через Telegram
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта? <a href="/signup" className="text-primary hover:underline">Зарегистрироваться</a>
      </p>
    </form>
  )
}