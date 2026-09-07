# SOVA AI

**Конструктор персональных AI-помощников**

SOVA AI — это современный SaaS-сервис, который позволяет создавать AI-помощников без знания программирования. Опишите задачу обычными словами, и SOVA AI сам создаст конфигурацию, подключит знания и запустит помощника.

## Возможности

- Создание AI-помощников на основе естественного языка
- Автоматическая генерация конфигурации с помощью AI
- База знаний с поддержкой PDF, DOCX, TXT, Markdown и URL
- RAG (Retrieval Augmented Generation) для ответов на основе документов
- Интеграция с Telegram
- Встроенный тестовый чат
- Управление версиями конфигурации
- Аналитика и отслеживание использования
- Поддержка множества AI-провайдеров (OpenAI, Anthropic, Google, Groq, OpenRouter)
- Многопользовательский SaaS с тарифами

## Технологический стек

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL с pgvector
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: OpenAI, Anthropic, Google Gemini, Groq, OpenRouter
- **Deployment**: Vercel-ready

## Структура проекта

```
sova-ai/
├── app/
│   ├── (marketing)/          # Landing page
│   ├── (auth)/               # Auth pages
│   ├── dashboard/            # Dashboard
│   ├── assistant/            # Assistant management
│   ├── admin/                # Admin panel
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── dashboard/            # Dashboard components
│   ├── assistant/            # Assistant components
│   ├── onboarding/           # Onboarding components
│   └── chat/                 # Chat components
├── lib/
│   ├── ai/                   # AI provider abstraction
│   ├── auth/                 # Authentication utilities
│   ├── database/             # Database queries
│   ├── knowledge/            # Knowledge base processing
│   ├── telegram/             # Telegram integration
│   ├── usage/                # Usage tracking
│   └── security/             # Security utilities
├── types/                    # TypeScript type definitions
├── hooks/                    # Custom React hooks
├── services/                 # External services
├── supabase/
│   ├── migrations/           # Database migrations
│   └── seed/                 # Seed data
├── docs/                     # Documentation
├── tests/                    # Tests
└── public/                   # Static assets
```

## Локальный запуск

### Требования

- Node.js 18+
- npm или yarn
- Supabase account

### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-org/sova-ai.git
cd sova-ai
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
cp .env.example .env.local
```

Заполните `.env.local` вашими значениями.

4. Настройте Supabase:
   - Создайте новый проект в Supabase
   - Выполните миграции из `supabase/migrations/`
   - Добавьте `pgvector` extension в Supabase SQL Editor

5. Запустите разработческий сервер:
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Переменные окружения

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
OPENROUTER_API_KEY=
GROQ_API_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Encryption
ENCRYPTION_KEY=
```

## Деплой

### Vercel

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в Vercel Dashboard
3. Деплой произойдет автоматически

### Railway

1. Подключите репозиторий к Railway
2. Добавьте переменные окружения
3. Запустите деплой

## Лицензия

MIT
