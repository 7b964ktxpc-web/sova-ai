'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, LayoutDashboard, LogOut, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAssistants } from '@/hooks/use-assistants'

const navItems = [
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/onboarding', label: 'Онбординг', icon: Plus },
]

export function Sidebar() {
  const pathname = usePathname()
  const { assistants } = useAssistants()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className={cn("flex flex-col h-full border-r bg-background transition-all", collapsed ? "w-16" : "w-64")}>
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && <span className="font-bold text-lg">SOVA AI</span>}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <Button variant={pathname === item.href ? 'secondary' : 'ghost'} className={cn("w-full justify-start", collapsed && "justify-center px-2")}>
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Помощники</h4>}
          <div className="space-y-1">
            {assistants.map(assistant => (
              <Link key={assistant.id} href={`/assistant/${assistant.id}`}>
                <Button variant={pathname.startsWith(`/assistant/${assistant.id}`) ? 'secondary' : 'ghost'} className={cn("w-full justify-start", collapsed && "justify-center px-2")}>
                  <MessageSquare className="h-4 w-4" />
                  {!collapsed && <span className="ml-2 truncate">{assistant.name}</span>}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-2 border-t">
        <Link href="/auth/login">
          <Button variant="ghost" className={cn("w-full justify-start text-destructive", collapsed && "justify-center px-2")}>
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Выйти</span>}
          </Button>
        </Link>
      </div>
    </div>
  )
}
