import { auth } from '@/lib/auth'
import { getConversationsAction } from '@/app/actions/sidebar'
import { redirect } from 'next/navigation'
import ChatLayoutClient from './chat-layout-client'
import AppHeader from '@/app/components/layout/app-header'

interface ConversationType {
  id: string
  userId: string
  title: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

export default async function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id?: string }
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Obtener todas las conversaciones del usuario
  const conversations = await getConversationsAction()
  
  // Agregar conteo de mensajes para cada conversación
  const conversationsWithCount = conversations.map((conv: ConversationType) => ({
    ...conv,
    _count: {
      messages: 0 // Esto se puede optimizar con una query más específica si es necesario
    }
  }))

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      <AppHeader title="FitBot - Tu Entrenador Personal con IA" />
      <div className="flex flex-1 overflow-hidden">
        <ChatLayoutClient 
          conversations={conversationsWithCount}
          currentConversationId={params.id}
        >
          {children}
        </ChatLayoutClient>
      </div>
    </div>
  )
}