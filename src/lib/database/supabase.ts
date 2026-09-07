import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isBuildPhase = process.env.NEXT_PHASE === 'build' || process.env.NEXT_PHASE === 'phase-export'

export function createClientComponentClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isBuildPhase) {
      return createBrowserClient('http://localhost', 'dummy-key')
    }
    throw new Error('Missing Supabase environment variables')
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createServerComponentClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isBuildPhase) {
      return createClient('http://localhost', 'dummy-key')
    }
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export function createServiceRoleClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isBuildPhase) {
      return createClient('http://localhost', 'dummy-key')
    }
    throw new Error('Missing Supabase environment variables')
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    if (isBuildPhase) {
      return createClient('http://localhost', 'dummy-key')
    }
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
