'use client'

import * as React from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'

export default function AssistantChatPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-[calc(100vh-100px)]">
      <ChatInterface assistantId={params.id} />
    </div>
  )
}
