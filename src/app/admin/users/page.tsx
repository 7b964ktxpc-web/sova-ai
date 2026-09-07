'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/database/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, Shield, User, Crown, Trash2, CheckCircle2, XCircle, Settings, Bell } from 'lucide-react'

type User = {
  id: string
  email: string
  full_name?: string
  plan: string
  role: string
  telegram_id?: string
  created_at: string
}

type Assistant = {
  id: string
  name: string
  user_id: string
  is_active: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])
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

      const { data: assistantsData } = await supabase
        .from('assistants')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(usersData || [])
      setAssistants(assistantsData || [])
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

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    setUpdating(true)
    setMessage(null)

    try {
      const supabase = createClientComponentClient()
      const newRole = currentRole === 'admin' ? 'user' : 'admin'
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setMessage({ type: 'success', text: newRole === 'admin' ? 'Права администратора выданы' : 'Права администратора сняты' })
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка обновления роли' })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Удалить пользователя? Это действие необратимо.')) return

    setUpdating(true)
    setMessage(null)

    try {
      const supabase = createClientComponentClient()
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Пользователь удален' })
      setSelectedUser(null)
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка удаления пользователя' })
    } finally {
      setUpdating(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const getUserAssistants = (userId: string) => {
    return assistants.filter(a => a.user_id === userId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
          <p className="mt-2 text-gray-600">
            Управление пользователями и тарифами
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Обновить
        </Button>
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
            <CardTitle className="text-sm font-medium text-gray-500">Админов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Помощников</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Активных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.filter(a => a.is_active).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Поиск</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по email или имени..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список пользователей</CardTitle>
              <CardDescription>
                Найдено: {filteredUsers.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUsers.map((user) => (
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
                        {user.telegram_id && (
                          <p className="text-xs text-gray-400">TG: {user.telegram_id}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                      </Badge>
                      <Badge variant="outline">
                        {user.plan === 'free' ? 'Free' : user.plan === 'pro' ? 'Pro' : 'Business'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        Управлять
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle>Управление</CardTitle>
                <CardDescription>
                  {selectedUser.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Тариф
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

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Роль
                  </label>
                  <Button
                    variant={selectedUser.role === 'admin' ? 'destructive' : 'default'}
                    onClick={() => handleToggleAdmin(selectedUser.id, selectedUser.role)}
                    disabled={updating}
                    className="w-full"
                  >
                    {selectedUser.role === 'admin' ? (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Снять админа
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Сделать админом
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Помощники
                  </label>
                  <div className="space-y-2">
                    {getUserAssistants(selectedUser.id).map((assistant) => (
                      <div
                        key={assistant.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{assistant.name}</span>
                        </div>
                        <Badge variant={assistant.is_active ? 'default' : 'secondary'} className="text-xs">
                          {assistant.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                    ))}
                    {getUserAssistants(selectedUser.id).length === 0 && (
                      <p className="text-sm text-gray-500">Нет помощников</p>
                    )}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  disabled={updating}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить пользователя
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Система</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Всего пользователей</span>
                  <span className="text-lg font-semibold">{users.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Админов</span>
                  <span className="text-lg font-semibold">{users.filter(u => u.role === 'admin').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Всего помощников</span>
                  <span className="text-lg font-semibold">{assistants.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Активных</span>
                  <span className="text-lg font-semibold">{assistants.filter(a => a.is_active).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}