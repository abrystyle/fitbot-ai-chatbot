import { auth } from '@/lib/auth'
import { getConversation, sendMessage } from '@/app/actions/chat'
import ChatInterface from '@/app/components/chat/chat-interface'
import { redirect } from 'next/navigation'

interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  const conversation = await getConversation(params.id)

  if (!conversation) {
    redirect('/chat')
  }

  // Server Action wrapper para el componente cliente
  async function handleSendMessage(formData: FormData) {
    'use server'
    return await sendMessage(formData)
  }

  return (
    <div className="h-full">
      <ChatInterface 
        conversationId={conversation.id}
        initialMessages={conversation.messages || []}
        sendMessageAction={handleSendMessage}
      />
    </div>
  )
}