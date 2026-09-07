'use client'

import * as React from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { createClientComponentClient } from '@/lib/database/supabase'
import { useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClientComponentClient> | null>(null)

  React.useState(() => {
    try {
      setSupabase(createClientComponentClient())
    } catch {
      console.error('Failed to create Supabase client')
    }
  })

  React.useEffect(() => {
    if (!supabase) return
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const u = data.user
        setUser(u ? { email: u.email, full_name: u.user_metadata?.full_name } : null)
      } catch {
        console.error('Failed to fetch user')
      }
    }
    fetchUser()
  }, [supabase])

  if (!supabase) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="SOVA AI" user={user || undefined} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
