'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Menu, Bell, User, LogOut } from 'lucide-react'
import { createClientComponentClient } from '@/lib/database/supabase'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title: string
  user?: { email?: string; full_name?: string }
}

export function Header({ title, user }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm hidden md:block">{user?.full_name || user?.email || 'Пользователь'}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Выйти">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
