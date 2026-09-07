'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import type { KnowledgeDocument } from '@/types'

interface KnowledgeListProps {
  documents: KnowledgeDocument[]
  onDelete: (id: string) => void
}

export function KnowledgeList({ documents, onDelete }: KnowledgeListProps) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Нет документов</h3>
          <p className="text-sm text-muted-foreground mt-1">Загрузите документы для обучения помощника</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: KnowledgeDocument['status']) => {
    switch (status) {
      case 'ready': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusVariant = (status: KnowledgeDocument['status']): 'success' | 'warning' | 'destructive' | 'secondary' => {
    switch (status) {
      case 'ready': return 'success'
      case 'processing': return 'warning'
      case 'error': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-3">
      {documents.map(doc => (
        <Card key={doc.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm">{doc.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusVariant(doc.status)}>
                      {doc.status === 'ready' ? 'Готов' : doc.status === 'processing' ? 'Обработка' : doc.status === 'error' ? 'Ошибка' : 'Загрузка'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{doc.chunk_count} фрагментов</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(doc.status)}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(doc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {doc.error_message && <p className="text-sm text-destructive mt-2">{doc.error_message}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
