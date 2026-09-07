'use client'

import * as React from 'react'
import { KnowledgeUpload } from '@/components/knowledge/knowledge-upload'
import { KnowledgeList } from '@/components/knowledge/knowledge-list'
import { useKnowledge } from '@/hooks/use-knowledge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AssistantKnowledgePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { documents, fetchDocuments, deleteDocument } = useKnowledge(params.id)

  React.useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">База знаний</h1>
          <p className="text-sm text-muted-foreground">Управление документами помощника</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Загрузка документов</CardTitle>
          <CardDescription>Загрузите файлы для обучения помощника</CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeUpload assistantId={params.id} onUploadComplete={fetchDocuments} />
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Документы ({documents.length})</h3>
        <KnowledgeList documents={documents} onDelete={deleteDocument} />
      </div>
    </div>
  )
}
