import { redirect } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/database/supabase'
import { cookies } from 'next/headers'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  if (!accessToken) {
    redirect('/login?callbackUrl=/admin')
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    redirect('/login?callbackUrl=/admin')
  }

  const userRole = (data.user.user_metadata?.role as string) || 'user'
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
