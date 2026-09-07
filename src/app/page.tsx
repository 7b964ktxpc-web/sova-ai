import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles, MessageSquare, Database, Shield, Zap } from 'lucide-react'

export default function Home() {
  const features = [
    { icon: Sparkles, title: 'AI-помощник за минуты', description: 'Опишите задачу простыми словами, и SOVA AI создаст готового помощника' },
    { icon: Database, title: 'База знаний', description: 'Загружайте документы, PDF, веб-страницы — помощник будет отвечать по ним' },
    { icon: MessageSquare, title: 'Множество каналов', description: 'Telegram, веб-чат, API — один помощник для всех каналов' },
    { icon: Shield, title: 'Безопасность', description: 'Данные хранятся в защищенном облаке, поддержка RLS политик' },
    { icon: Zap, title: 'Быстрые модели', description: 'OpenAI, Anthropic, Google, Groq — выбирайте лучший провайдер' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">SOVA AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost">Войти</Button></Link>
            <Link href="/signup"><Button>Начать бесплатно</Button></Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Создайте AI-помощника<br />за несколько минут
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Опишите задачу обычными словами — SOVA AI сам создаст конфигурацию, подключит знания и запустит помощника.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup"><Button size="lg" className="text-base px-8">Начать бесплатно</Button></Link>
            <Link href="/login"><Button variant="outline" size="lg" className="text-base px-8">Уже есть аккаунт</Button></Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24">
          <h2 className="text-3xl font-bold text-center mb-12">Возможности платформы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы создать помощника?</h2>
          <p className="text-muted-foreground mb-8">Начните бесплатно, без кредитной карты</p>
          <Link href="/signup"><Button size="lg" className="px-8">Создать аккаунт</Button></Link>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 SOVA AI. Все права защищены.
        </div>
      </footer>
    </div>
  )
}
