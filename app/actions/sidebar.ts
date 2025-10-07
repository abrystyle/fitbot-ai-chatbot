'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SUBSCRIPTION_LIMITS, DEFAULT_MESSAGES } from '@/lib/constants'

// Verificar límites de conversaciones
async function checkConversationLimits(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  })

  if (!user) return false

  const conversationCount = await prisma.conversation.count({
    where: { userId }
  })

  const limit = SUBSCRIPTION_LIMITS[user.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS]
  return conversationCount < limit
}

export async function createNewConversationAction() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Verificar límites
  if (!await checkConversationLimits(session.user.id)) {
    throw new Error(DEFAULT_MESSAGES.limit_reached)
  }

  const conversation = await prisma.conversation.create({
    data: {
      id: nanoid(),
      title: 'Nueva conversación',
      userId: session.user.id,
    }
  })

  revalidatePath('/chat')
  redirect(`/chat/${conversation.id}`)
}

export async function deleteConversationAction(conversationId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  // Verificar que la conversación pertenece al usuario
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId: session.user.id
    }
  })

  if (!conversation) {
    throw new Error('Conversación no encontrada')
  }

  await prisma.conversation.delete({
    where: { id: conversationId }
  })

  revalidatePath('/chat')
  return { success: true }
}

export async function getConversationsAction() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return []
  }

  return prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })
}