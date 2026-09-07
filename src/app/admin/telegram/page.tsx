import { redirect } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/database/supabase'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/admin-sidebar'

export default async function AdminTelegramPage() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  if (!accessToken) {
    redirect('/login?callbackUrl=/admin/telegram')
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    redirect('/login?callbackUrl=/admin/telegram')
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
            <h1 className="text-3xl font-bold text-gray-900">Telegram</h1>
            <p className="mt-2 text-gray-600">
              Управление Telegram-ботами и веб-аппом
            </p>
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Создание Telegram Web App</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Инструкция по созданию бота и подключению веб-аппа будет здесь
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
