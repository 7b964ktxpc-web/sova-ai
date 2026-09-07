'use client'

import * as React from 'react'
import { useCallback, useRef } from 'react'
import { Progress } from '@/components/ui/progress'
import { Upload, Loader2 } from 'lucide-react'
import { useKnowledge } from '@/hooks/use-knowledge'
import { validateFileType, validateFileSize } from '@/lib/security/validation'
import { cn } from '@/lib/utils'

interface KnowledgeUploadProps {
  assistantId: string
  onUploadComplete?: () => void
}

export function KnowledgeUpload({ assistantId, onUploadComplete }: KnowledgeUploadProps) {
  const [uploading, setUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [dragOver, setDragOver] = React.useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadDocument } = useKnowledge(assistantId)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    const typeValidation = validateFileType(file, ['pdf', 'docx', 'txt', 'md', 'html'])
    if (!typeValidation.valid) {
      alert(typeValidation.message)
      return
    }
    const sizeValidation = validateFileSize(file, 10)
    if (!sizeValidation.valid) {
      alert(sizeValidation.message)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      await uploadDocument(file)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
        onUploadComplete?.()
      }, 500)
    } catch {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [uploadDocument, onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input ref={fileInputRef} type="file" className="hidden" onChange={e => handleFileSelect(e.target.files)} accept=".pdf,.docx,.txt,.md,.html" />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">Перетащите файлы сюда или нажмите для загрузки</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, MD, HTML (до 10MB)</p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Загрузка...</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}
    </div>
  )
}
