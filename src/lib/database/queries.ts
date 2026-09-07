import { createClientComponentClient } from './supabase'

export async function getUserProfile(userId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createAssistant(userId: string, input: { name: string; description?: string; settings?: Record<string, unknown> }) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('assistants')
    .insert({ user_id: userId, ...input })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAssistants(userId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('assistants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAssistantById(id: string, userId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('assistants')
    .select('*, assistant_provider_configs(*), channels(*), knowledge_documents(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateAssistant(id: string, userId: string, updates: Record<string, unknown>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('assistants')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAssistant(id: string, userId: string) {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .from('assistants')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function saveAssistantVersion(assistantId: string, version: number, configuration: Record<string, unknown>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('assistant_versions')
    .insert({ assistant_id: assistantId, version, configuration })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAssistantVersions(assistantId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('assistant_versions')
    .select('*')
    .eq('assistant_id', assistantId)
    .order('version', { ascending: false })
  if (error) throw error
  return data
}

export async function getKnowledgeDocuments(assistantId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('knowledge_documents')
    .select('*')
    .eq('assistant_id', assistantId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createKnowledgeDocument(input: {
  assistant_id: string
  user_id: string
  name: string
  type: string
  size?: number
  storage_path?: string
}) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('knowledge_documents')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateKnowledgeDocument(id: string, updates: Record<string, unknown>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('knowledge_documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteKnowledgeDocument(id: string) {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .from('knowledge_documents')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getConversations(assistantId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .eq('assistant_id', assistantId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createConversation(assistantId: string, userId?: string, metadata?: Record<string, unknown>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('conversations')
    .insert({ assistant_id: assistantId, user_id: userId, metadata })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMessages(conversationId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createMessage(conversationId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, unknown>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content, metadata })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getProviderConfigs(assistantId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('assistant_provider_configs')
    .select('*, ai_providers(*)')
    .eq('assistant_id', assistantId)
  if (error) throw error
  return data
}

export async function createProviderConfig(input: {
  assistant_id: string
  provider_id: string
  model: string
  temperature?: number
  max_tokens?: number
  top_p?: number
  settings?: Record<string, unknown>
}) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('assistant_provider_configs')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getChannels(assistantId: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('assistant_id', assistantId)
  if (error) throw error
  return data
}

export async function updateChannel(id: string, updates: Record<string, unknown>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('channels')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
