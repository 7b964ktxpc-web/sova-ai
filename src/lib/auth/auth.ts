import { createServiceRoleClient } from '@/lib/database/supabase'

export interface Session {
  user: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    plan: 'free' | 'pro' | 'business'
    role: 'user' | 'admin'
  }
  access_token: string
  refresh_token?: string
}

export async function signIn(email: string, password: string): Promise<Session> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  if (!data.session) throw new Error('Ошибка входа')
  const userEmail = data.user.email || ''
  return {
    user: {
      id: data.user.id,
      email: userEmail,
      full_name: data.user.user_metadata?.full_name,
      avatar_url: data.user.user_metadata?.avatar_url,
      plan: 'free',
      role: 'user',
    },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token || undefined,
  }
}

export async function signUp(email: string, password: string, fullName?: string): Promise<Session> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw new Error(error.message)
  if (!data.session) throw new Error('Не удалось создать аккаунт')
  const user = data.user
  if (!user) throw new Error('Не удалось создать аккаунт')
  const userEmail = user.email || ''
  return {
    user: {
      id: user.id,
      email: userEmail,
      full_name: fullName,
      plan: 'free',
      role: 'user',
    },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token || undefined,
  }
}

export async function signOut(): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getSession(token: string): Promise<Session | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  const userEmail = data.user.email || ''
  return {
    user: {
      id: data.user.id,
      email: userEmail,
      full_name: data.user.user_metadata?.full_name,
      avatar_url: data.user.user_metadata?.avatar_url,
      plan: 'free',
      role: 'user',
    },
    access_token: token,
  }
}

export async function resetPassword(email: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })
  if (error) throw new Error(error.message)
}

export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}
