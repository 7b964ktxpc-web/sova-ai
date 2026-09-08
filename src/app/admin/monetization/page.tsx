'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/database/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, DollarSign, TrendingUp, CheckCircle2, XCircle, Plus, Edit } from 'lucide-react'

type User = {
  id: string
  email: string
  full_name?: string
  plan: string
  role: string
  created_at: string
}

type Subscription = {
  id: string
  user_id: string
  plan: string
  status: string
  current_period_start?: string
  current_period_end?: string
  created_at: string
}

type PricingPlan = {
  id: string
  name: string
  price: number
  features: string[]
  is_active: boolean
}

const defaultPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['1 помощник', '1000 сообщений/мес', 'Базовая поддержка'],
    is_active: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 990,
    features: ['5 помощников', '10000 сообщений/мес', 'Приоритетная поддержка', 'API доступ'],
    is_active: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 2990,
    features: ['Неограниченно помощников', 'Неограниченно сообщений', 'Персональный менеджер', 'Кастомная интеграция'],
    is_active: true,
  },
]

export default function AdminMonetizationPage() {
  const [users, setUsers] = useState<User[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<PricingPlan[]>(defaultPlans)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClientComponentClient()
      
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(usersData || [])
      setSubscriptions(subscriptionsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserPlan = async (userId: string, plan: string) => {
    setUpdating(true)
    setMessage(null)

    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase
        .from('profiles')
        .update({ plan })
        .eq('id', userId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Тариф обновлен' })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка обновления тарифа' })
    } finally {
      setUpdating(false)
    }
  }

  const getUserSubscription = (userId: string) => {
    return subscriptions.find(s => s.user_id === userId)
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Монетизация</h1>
        <p className="mt-2 text-gray-600">
          Управление тарифами и подписками
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Всего пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Free</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.plan === 'free').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.plan === 'pro').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Business</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.plan === 'business').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Пользователи и тарифы</CardTitle>
              <CardDescription>
                Управление подписками пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по email или имени..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-3">
                  {filteredUsers.map((user) => {
                    const subscription = getUserSubscription(user.id)
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name || 'Без имени'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {subscription && (
                              <p className="text-xs text-gray-400">
                                Подписка: {subscription.plan} ({subscription.status})
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.plan === 'free' ? 'secondary' : user.plan === 'pro' ? 'default' : 'destructive'}>
                            {user.plan === 'free' ? 'Free' : user.plan === 'pro' ? 'Pro' : 'Business'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            Изменить
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle>Изменить тариф</CardTitle>
                <CardDescription>
                  {selectedUser.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Текущий тариф: <span className="font-semibold">{selectedUser.plan}</span>
                  </label>
                  <select
                    value={selectedUser.plan}
                    onChange={(e) => handleUpdateUserPlan(selectedUser.id, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={updating}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Что входит:</p>
                  {plans.find(p => p.id === selectedUser.plan)?.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="w-full"
                >
                  Закрыть
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Тарифные планы</CardTitle>
              <CardDescription>
                Доступные планы подписок
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      plan.id === 'free' ? 'border-gray-200 bg-gray-50' :
                      plan.id === 'pro' ? 'border-indigo-500 bg-indigo-50' :
                      'border-purple-500 bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.price === 0 ? 'Бесплатно' : `₽${plan.price}/мес`}
                    </p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}