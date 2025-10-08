'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import ConversationSidebar from './conversation-sidebar'
import { Menu, X } from 'lucide-react'

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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header con botón para toggle sidebar */}
        <div className="bg-white border-b border-gray-200 p-4 lg:hidden flex flex-row items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <h2 className='font-semibold'>FitBot</h2>
        </div>

        {/* Contenido del chat */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </>
  )
}