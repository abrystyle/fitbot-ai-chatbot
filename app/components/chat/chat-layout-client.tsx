'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConversationSidebar from './conversation-sidebar'

interface ConversationType {
  id: string
  title: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  _count: {
    messages: number
  }
}

interface ChatLayoutClientProps {
  children: React.ReactNode
  conversations: ConversationType[]
  currentConversationId?: string
}

export default function ChatLayoutClient({
  children,
  conversations,
  currentConversationId
}: ChatLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const handleSelectConversation = (conversationId: string) => {
    router.push(`/chat/${conversationId}`)
    setSidebarOpen(false) // Cerrar sidebar en móviles
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0 shadow-lg sm:shadow-none' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-80 max-h-dvh bg-white  transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
      `}>
        <ConversationSidebar 
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 blur-xl bg-white/70 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </>
  )
}