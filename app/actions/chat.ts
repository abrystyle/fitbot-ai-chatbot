import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/ai'
import { streamText } from 'ai'
import { createStreamableValue } from '@ai-sdk/rsc'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { SUBSCRIPTION_LIMITS, DEFAULT_MESSAGES, RATE_LIMITS } from '@/lib/constants'

// Schema de validación para el chat
const ChatSchema = z.object({
  message: z.string().min(1).max(500),
  conversationId: z.string().optional(),
})

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

  const limit = SUBSCRIPTION_LIMITS[user.subscriptionTier]
  return conversationCount < limit
}

// Rate limiting básico (en producción usar Redis)
const chatRateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = chatRateLimit.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    chatRateLimit.set(userId, { count: 1, resetTime: now + 60 * 60 * 1000 }) // 1 hora
    return true
  }

  if (userLimit.count >= RATE_LIMITS.CHAT_PER_HOUR) {
    return false
  }

  userLimit.count++
  return true
}

export async function sendMessage(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  // Rate limiting
  if (!checkRateLimit(session.user.id)) {
    throw new Error('Límite de mensajes por hora alcanzado')
  }

  const { message, conversationId } = ChatSchema.parse({
    message: formData.get('message'),
    conversationId: formData.get('conversationId') || undefined,
  })

  // Verificar límites de conversaciones
  if (!conversationId && !await checkConversationLimits(session.user.id)) {
    throw new Error(DEFAULT_MESSAGES.limit_reached)
  }

  let conversation
  
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } }
    })
  } else {
    conversation = await prisma.conversation.create({
      data: {
        id: nanoid(),
        title: message.slice(0, 50),
        userId: session.user.id,
      },
      include: { messages: true }
    })
  }

  if (!conversation) {
    throw new Error('Conversación no encontrada')
  }

  // Crear mensaje del usuario
  await prisma.message.create({
    data: {
      id: nanoid(),
      content: message,
      role: 'USER',
      conversationId: conversation.id,
    }
  })

  // Preparar contexto para la IA
  const messages = [
    ...conversation.messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'USER' ? 'user' : 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: message }
  ]

  // Obtener perfil de fitness del usuario
  const fitnessProfile = await prisma.fitnessProfile.findUnique({
    where: { userId: session.user.id }
  })

  // Crear contexto personalizado
  let systemPrompt = `Eres FitBot, un entrenador personal con IA especializado en fitness y nutrición.

Puedes usar Markdown enriquecido para responder. Tienes acceso a:
- **Texto en negrita** y *cursiva*
- Listas numeradas y con viñetas
- Tablas para planes de entrenamiento y valores nutricionales
- Bloques de código para rutinas específicas
- Matemáticas LaTeX para cálculos (usa $$ para ecuaciones)
- Diagramas Mermaid para visualizar progreso

Para consejos importantes, usa:
> **💡 Consejo:** Tu texto aquí

Para información nutricional:
> **🥗 Nutrición:** Tu información aquí

Para advertencias:
> **⚠️ Importante:** Tu advertencia aquí`
  
  if (fitnessProfile) {
    systemPrompt += `\n\nPerfil del usuario:
- Objetivos: ${fitnessProfile.fitnessGoals.join(', ')}
- Nivel: ${fitnessProfile.experience || 'No especificado'}
- Actividad: ${fitnessProfile.activityLevel || 'No especificado'}
- Dieta: ${fitnessProfile.dietType || 'No especificado'}
- Altura: ${fitnessProfile.height}cm
- Peso: ${fitnessProfile.weight}kg
- Alergias: ${fitnessProfile.allergies.join(', ')}`
  }

  // Crear stream para la respuesta
  const stream = createStreamableValue('')

  ;(async () => {
    try {
      // Verificar si hay API key configurada
      if (!process.env.OPENAI_API_KEY) {
        // Simular respuesta de demostración si no hay API key
        const demoResponse = `# ¡Hola! Soy FitBot 💪

## 🚀 Configuración requerida
Para funcionar completamente, necesito que configures una API key de OpenAI en el archivo \`.env.local\`:

\`\`\`bash
OPENAI_API_KEY=tu_clave_openai_aqui
\`\`\`

## 📝 Tu consulta
> **Pregunta:** ${message}

## 💡 Consejos generales mientras configuras la API

### 🏋️ Principios básicos del entrenamiento:
1. **Consistencia** - Mantén una rutina regular
2. **Progresión** - Aumenta gradualmente la intensidad
3. **Descanso** - Permite recuperación muscular
4. **Nutrición** - Alimenta tu cuerpo correctamente

### 📊 Ejemplo de rutina semanal

| Día | Actividad | Duración |
|-----|-----------|----------|
| Lunes | Fuerza (Tren superior) | 45 min |
| Martes | Cardio | 30 min |
| Miércoles | Fuerza (Tren inferior) | 45 min |
| Jueves | Descanso activo | 20 min |
| Viernes | Fuerza (Cuerpo completo) | 50 min |
| Sábado | Cardio/Actividad libre | 30-60 min |
| Domingo | Descanso | - |

### 🥗 Macronutrientes esenciales
- **Proteína:** 1.6-2.2g por kg de peso corporal
- **Carbohidratos:** 3-7g por kg (según actividad)
- **Grasas:** 20-35% del total calórico

> **⚠️ Importante:** Consulta con un profesional antes de iniciar cualquier programa de ejercicios intenso.

¡Configura tu **API key** para obtener respuestas personalizadas y planes específicos para tus objetivos! 🎯`

        // Simular streaming
        let currentText = ''
        for (let i = 0; i < demoResponse.length; i += 3) {
          currentText = demoResponse.slice(0, i + 3)
          stream.update(currentText)
          await new Promise(resolve => setTimeout(resolve, 20))
        }
        stream.update(demoResponse)

        // Guardar respuesta demo
        await prisma.message.create({
          data: {
            id: nanoid(),
            content: demoResponse,
            role: 'ASSISTANT',
            conversationId: conversation.id,
          }
        })

        stream.done()
        return
      }

      const { textStream } = await streamText({
        model: openai('gpt-4-turbo-preview'),
        system: systemPrompt,
        messages,
        temperature: 0.7,
      })

      let fullResponse = ''
      
      for await (const text of textStream) {
        fullResponse += text
        stream.update(fullResponse)
      }

      // Guardar respuesta de la IA
      await prisma.message.create({
        data: {
          id: nanoid(),
          content: fullResponse,
          role: 'ASSISTANT',
          conversationId: conversation.id,
        }
      })

      stream.done()
      
    } catch (error) {
      console.error('Error al generar respuesta:', error)
      
      // Respuesta de error amigable
      const errorResponse = 'Lo siento, ha ocurrido un error al generar la respuesta. Por favor verifica tu configuración de API keys e inténtalo nuevamente.'
      
      try {
        stream.update(errorResponse)
        
        // Guardar mensaje de error
        await prisma.message.create({
          data: {
            id: nanoid(),
            content: errorResponse,
            role: 'ASSISTANT',
            conversationId: conversation.id,
          }
        })
        
        stream.done()
      } catch {
        // Stream ya cerrado, solo guardamos el mensaje
        await prisma.message.create({
          data: {
            id: nanoid(),
            content: errorResponse,
            role: 'ASSISTANT',
            conversationId: conversation.id,
          }
        })
      }
    }
  })()

  return {
    conversationId: conversation.id,
    messageStream: stream.value,
  }
}

export async function createNewConversation() {
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

  redirect(`/chat/${conversation.id}`)
}

export async function deleteConversation(conversationId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  await prisma.conversation.delete({
    where: {
      id: conversationId,
      userId: session.user.id,
    }
  })

  revalidatePath('/chat')
}

export async function updateConversationTitle(conversationId: string, title: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  await prisma.conversation.update({
    where: {
      id: conversationId,
      userId: session.user.id,
    },
    data: { title: title.slice(0, 100) }
  })

  revalidatePath('/chat')
}

export async function getConversations() {
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

export async function getConversation(conversationId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  return prisma.conversation.findUnique({
    where: {
      id: conversationId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })
}