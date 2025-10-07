import ChatContainer from '@/app/components/chat/chat-container'

export default async function ChatPage() {
  return (
    <div className="container max-w-7xl mx-auto p-4 h-[calc(100vh-4rem)]">
      <ChatContainer />
    </div>
  )
}