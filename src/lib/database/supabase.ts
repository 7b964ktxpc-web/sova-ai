import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClientComponentClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      throw new Error('Missing Supabase environment variables')
    }
    return createBrowserClient('http://localhost', 'dummy-key')
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createServerComponentClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      throw new Error('Missing Supabase environment variables')
    }
    return createClient('http://localhost', 'dummy-key')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export function createServiceRoleClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      throw new Error('Missing Supabase environment variables')
    }
    return createClient('http://localhost', 'dummy-key')
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    if (typeof window !== 'undefined') {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
    }
    return createClient('http://localhost', 'dummy-key')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
