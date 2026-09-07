import { redirect } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/database/supabase'
import { cookies } from 'next/headers'

export default async function TelegramAuthPage({ searchParams }: { searchParams: { code?: string; origin?: string } }) {
  const code = searchParams?.code
  const origin = searchParams?.origin || '/dashboard'

  if (!code) {
    redirect('/login?error=telegram_code_missing')
  }

  try {
    const supabase = createServiceRoleClient()
    const response = await fetch('https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/getWebhookInfo')
    const webhookInfo = await response.json()

    if (!webhookInfo.ok || !webhookInfo.result) {
      redirect('/login?error=telegram_webhook_not_configured')
    }

    const verified = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `telegram_${code}@sova.local`,
    })

    if (verified.error) {
      redirect('/login?error=telegram_auth_failed')
    }

    redirect(origin)
  } catch {
    redirect('/login?error=telegram_auth_error')
  }
}
