import { sendMessage } from '@/app/actions/chat'
import ChatInterface from './chat-interface'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

interface PrismaMessage {
  id: string
  content: string
  role: string
  createdAt: Date
}

interface ChatContainerProps {
  conversationId?: string
}

export default async function ChatContainer({ conversationId }: ChatContainerProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Obtener conversación existente o crear una nueva
  let conversation
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { 
        id: conversationId,
        userId: session.user.id 
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
  }

    const messages: Message[] = conversation?.messages.map((msg: PrismaMessage) => ({
    id: msg.id,
    content: msg.content,
    role: msg.role as 'user' | 'assistant',
    createdAt: msg.createdAt
  })) || []

  // Server Action wrapper para el componente cliente
  async function handleSendMessage(formData: FormData) {
    'use server'
    return await sendMessage(formData)
  }

  return (
    <ChatInterface 
      initialMessages={messages}
      conversationId={conversation?.id}
      sendMessageAction={handleSendMessage}
    />
  )
}