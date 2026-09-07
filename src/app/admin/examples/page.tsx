import { redirect } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/database/supabase'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/admin-sidebar'

const blocks = [
  {
    title: 'OpenRouter — cURL',
    code: `curl https://openrouter.ai/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\
  -H "HTTP-Referer: $NEXT_PUBLIC_APP_URL" \\
  -H "X-Title: Sova AI" \\
  -d '{
    "model": "meta-llama/llama-3.1-8b-instruct:free",
    "messages": [{"role":"user","content":"Привет"}],
    "max_tokens": 1024
  }'`,
  },
  {
    title: 'OpenRouter — TypeScript fetch',
    code: `const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'Sova AI',
  },
  body: JSON.stringify({
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    messages: [{ role: 'user', content: 'Привет' }],
    max_tokens: 1024,
  }),
})

const data = await res.json()
console.log(data.choices?.[0]?.message?.content)`,
  },
  {
    title: 'OpenRouter — Python',
    code: `import os
import requests

resp = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "HTTP-Referer": os.getenv("NEXT_PUBLIC_APP_URL", ""),
        "X-Title": "Sova AI",
    },
    json={
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [{"role": "user", "content": "Привет"}],
        "max_tokens": 1024,
    },
)
print(resp.json()["choices"][0]["message"]["content"])`,
  },
  {
    title: 'Telegram Bot — cURL',
    code: `curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"`,
  },
  {
    title: 'Telegram Bot — TypeScript fetch',
    code: `const res = await fetch(\`https://api.telegram.org/bot\${process.env.TELEGRAM_BOT_TOKEN}/getMe\`)
const data = await res.json()
console.log(data.result)`,
  },
  {
    title: 'Telegram Bot — Python',
    code: `import os
import requests

token = os.getenv("TELEGRAM_BOT_TOKEN")
resp = requests.get(f"https://api.telegram.org/bot{token}/getMe")
print(resp.json()["result"])`,
  },
  {
    title: 'Telegram Web App — HTML entry',
    code: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
  </head>
  <body>
    <script>
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      console.log(tg.initDataUnsafe, tg.themeParams);
    </script>
  </body>
</html>`,
  },
  {
    title: 'Telegram Web App — TypeScript',
    code: `declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        initDataUnsafe: any
        themeParams: any
        sendData: (data: string) => void
        close: () => void
      }
    }
  }
}

const tg = window.Telegram?.WebApp
if (tg) {
  tg.ready()
  tg.expand()
  console.log(tg.initDataUnsafe, tg.themeParams)
}`,
  },
]

export default async function AdminExamplesPage() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  if (!accessToken) {
    redirect('/login?callbackUrl=/admin/examples')
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    redirect('/login?callbackUrl=/admin/examples')
  }

  const userRole = (data.user.user_metadata?.role as string) || 'user'
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Интеграции</h1>
            <p className="mt-2 text-gray-600">
              Готовые примеры для OpenRouter и Telegram
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {blocks.map((block) => (
                <div key={block.title} className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">{block.title}</h3>
                    <pre className="mt-4 overflow-x-auto rounded-md bg-gray-900 p-4 text-xs text-gray-100">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
