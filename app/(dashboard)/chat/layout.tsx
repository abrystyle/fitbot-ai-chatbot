import ChatLayout from '@/app/components/chat/chat-layout'

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id?: string }
}) {
  return (
    <ChatLayout params={params}>
      {children}
    </ChatLayout>
  )
}