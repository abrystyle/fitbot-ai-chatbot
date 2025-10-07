import { auth } from '@/lib/auth'
import { getConversation } from '@/app/actions/chat'
import { ChatInterface } from '@/app/components/chat/chat-interface'
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

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <ChatInterface 
        conversationId={conversation.id}
        initialMessages={conversation.messages || []}
      />
    </div>
  )
}