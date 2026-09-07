-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Providers
CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL UNIQUE CHECK (provider IN ('openai', 'anthropic', 'google', 'openrouter', 'groq')),
  api_key_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assistants
CREATE TABLE IF NOT EXISTS assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assistant Versions
CREATE TABLE IF NOT EXISTS assistant_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  configuration JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assistant_id, version)
);

-- Assistant Provider Configs
CREATE TABLE IF NOT EXISTS assistant_provider_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES ai_providers(id) ON DELETE CASCADE NOT NULL,
  model TEXT NOT NULL,
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1024,
  top_p FLOAT DEFAULT 1,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assistant_id, provider_id)
);

-- Knowledge Documents
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  error_message TEXT,
  storage_path TEXT,
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Knowledge Chunks
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE NOT NULL,
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channels
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('telegram', 'web', 'api')),
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assistant_id, type)
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  external_user_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Events
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'business')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assistants_user_id ON assistants(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_assistant_id ON knowledge_documents(assistant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_assistant_id ON knowledge_chunks(assistant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assistant_id ON conversations(assistant_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_assistant_id ON channels(assistant_id);

-- Vector similarity index
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Assistants policies
CREATE POLICY "Users can view own assistants" ON assistants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create assistants" ON assistants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assistants" ON assistants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assistants" ON assistants FOR DELETE USING (auth.uid() = user_id);

-- Assistant versions policies
CREATE POLICY "Users can view own assistant versions" ON assistant_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM assistants WHERE assistants.id = assistant_versions.assistant_id AND assistants.user_id = auth.uid())
);
CREATE POLICY "Users can create assistant versions" ON assistant_versions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM assistants WHERE assistants.id = assistant_versions.assistant_id AND assistants.user_id = auth.uid())
);

-- Assistant provider configs policies
CREATE POLICY "Users can view own provider configs" ON assistant_provider_configs FOR SELECT USING (
  EXISTS (SELECT 1 FROM assistants WHERE assistants.id = assistant_provider_configs.assistant_id AND assistants.user_id = auth.uid())
);
CREATE POLICY "Users can manage own provider configs" ON assistant_provider_configs FOR ALL USING (
  EXISTS (SELECT 1 FROM assistants WHERE assistants.id = assistant_provider_configs.assistant_id AND assistants.user_id = auth.uid())
);

-- Knowledge documents policies
CREATE POLICY "Users can view own knowledge documents" ON knowledge_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create knowledge documents" ON knowledge_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own knowledge documents" ON knowledge_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own knowledge documents" ON knowledge_documents FOR DELETE USING (auth.uid() = user_id);

-- Knowledge chunks policies
CREATE POLICY "Users can view own knowledge chunks" ON knowledge_chunks FOR SELECT USING (
  EXISTS (SELECT 1 FROM knowledge_documents WHERE knowledge_documents.id = knowledge_chunks.document_id AND knowledge_documents.user_id = auth.uid())
);
CREATE POLICY "Users can create knowledge chunks" ON knowledge_chunks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM knowledge_documents WHERE knowledge_documents.id = knowledge_chunks.document_id AND knowledge_documents.user_id = auth.uid())
);

-- Channels policies
CREATE POLICY "Users can view own channels" ON channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM assistants WHERE assistants.id = channels.assistant_id AND assistants.user_id = auth.uid())
);
CREATE POLICY "Users can manage own channels" ON channels FOR ALL USING (
  EXISTS (SELECT 1 FROM assistants WHERE assistants.id = channels.assistant_id AND assistants.user_id = auth.uid())
);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM assistants WHERE assistants.id = conversations.assistant_id AND assistants.user_id = auth.uid())
);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM assistants WHERE assistants.id = conversations.assistant_id AND assistants.user_id = auth.uid())
);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations
    JOIN assistants ON assistants.id = conversations.assistant_id
    WHERE conversations.id = messages.conversation_id AND assistants.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create messages" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    JOIN assistants ON assistants.id = conversations.assistant_id
    WHERE conversations.id = messages.conversation_id AND assistants.user_id = auth.uid()
  )
);

-- Usage events policies
CREATE POLICY "Users can view own usage" ON usage_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create usage events" ON usage_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
