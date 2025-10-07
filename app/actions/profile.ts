import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DEFAULT_MESSAGES } from '@/lib/constants'

// Schema de validación para el perfil de fitness
const FitnessProfileSchema = z.object({
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  age: z.number().min(13).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']),
  activityLevel: z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE']),
  goals: z.array(z.enum([
    'WEIGHT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 
    'GENERAL_HEALTH', 'COMPETITION_PREP', 'RECOVERY', 'FLEXIBILITY'
  ])).min(1),
  dietaryPreferences: z.array(z.enum([
    'OMNIVORE', 'VEGETARIAN', 'VEGAN', 'KETO', 'PALEO', 
    'MEDITERRANEAN', 'INTERMITTENT_FASTING', 'OTHER'
  ])),
  dietaryRestrictions: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
})

// Schema para actualizar preferencias de usuario
const UserPreferencesSchema = z.object({
  subscriptionTier: z.enum(['BASIC', 'PREMIUM', 'PRO']).optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    recommendations: z.boolean(),
  }).optional(),
})

export async function createOrUpdateFitnessProfile(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  const profileData = FitnessProfileSchema.parse({
    height: Number(formData.get('height')),
    weight: Number(formData.get('weight')),
    age: Number(formData.get('age')),
    gender: formData.get('gender'),
    experienceLevel: formData.get('experienceLevel'),
    activityLevel: formData.get('activityLevel'),
    goals: formData.getAll('goals'),
    dietaryPreferences: formData.getAll('dietaryPreferences'),
    dietaryRestrictions: formData.get('dietaryRestrictions') 
      ? (formData.get('dietaryRestrictions') as string).split(',').map(s => s.trim())
      : [],
    medicalConditions: formData.get('medicalConditions')
      ? (formData.get('medicalConditions') as string).split(',').map(s => s.trim())
      : [],
  })

  try {
    await prisma.fitnessProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...profileData,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        ...profileData,
      },
    })

    revalidatePath('/profile')
    return { success: true, message: 'Perfil actualizado correctamente' }

  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    throw new Error('Error al guardar el perfil')
  }
}

export async function getFitnessProfile() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  return prisma.fitnessProfile.findUnique({
    where: { userId: session.user.id }
  })
}

export async function updateUserPreferences(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  const preferences = UserPreferencesSchema.parse({
    subscriptionTier: formData.get('subscriptionTier') || undefined,
    notifications: {
      email: formData.get('emailNotifications') === 'true',
      push: formData.get('pushNotifications') === 'true',
      recommendations: formData.get('recommendationNotifications') === 'true',
    },
  })

  try {
    const updateData: any = {}
    
    if (preferences.subscriptionTier) {
      updateData.subscriptionTier = preferences.subscriptionTier
    }

    if (preferences.notifications) {
      updateData.emailNotifications = preferences.notifications.email
      updateData.pushNotifications = preferences.notifications.push
      updateData.recommendationNotifications = preferences.notifications.recommendations
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    revalidatePath('/profile')
    return { success: true, message: 'Preferencias actualizadas correctamente' }

  } catch (error) {
    console.error('Error al actualizar preferencias:', error)
    throw new Error('Error al guardar las preferencias')
  }
}

export async function deleteUserAccount() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  try {
    // Eliminar en orden por las relaciones de la base de datos
    await prisma.message.deleteMany({
      where: {
        conversation: { userId: session.user.id }
      }
    })

    await prisma.conversation.deleteMany({
      where: { userId: session.user.id }
    })

    await prisma.recommendation.deleteMany({
      where: { userId: session.user.id }
    })

    // await prisma.userProductPreference.deleteMany({
    //   where: { userId: session.user.id }
    // })

    await prisma.fitnessProfile.delete({
      where: { userId: session.user.id }
    }).catch(() => {}) // Ignorar si no existe

    await prisma.user.delete({
      where: { id: session.user.id }
    })

    redirect('/login')

  } catch (error) {
    console.error('Error al eliminar cuenta:', error)
    throw new Error('Error al eliminar la cuenta')
  }
}

export async function getUserStats() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  const [conversationCount, messageCount, recommendationCount, favoriteCount] = await Promise.all([
    prisma.conversation.count({
      where: { userId: session.user.id }
    }),
    prisma.message.count({
      where: {
        conversation: { userId: session.user.id },
        role: 'USER'
      }
    }),
    prisma.recommendation.count({
      where: { userId: session.user.id }
    }),
    prisma.productClick.count({
      where: { 
        userId: session.user.id,
        clickType: 'LIKE'
      }
    })
  ])

  return {
    conversations: conversationCount,
    messages: messageCount,
    recommendations: recommendationCount,
    favoriteProducts: favoriteCount,
  }
}

export async function exportUserData() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  try {
    const [user, fitnessProfile, conversations, recommendations, favorites] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionTier: true,
          createdAt: true,
        }
      }),
      prisma.fitnessProfile.findUnique({
        where: { userId: session.user.id }
      }),
      prisma.conversation.findMany({
        where: { userId: session.user.id },
        include: { messages: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.recommendation.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.productClick.findMany({
        where: { 
          userId: session.user.id,
          clickType: 'LIKE'
        },
        include: { product: true }
      })
    ])

    const exportData = {
      user,
      fitnessProfile,
      conversations,
      recommendations,
      favoriteProducts: favorites.map((fav: any) => fav.product),
      exportDate: new Date().toISOString(),
    }

    return exportData

  } catch (error) {
    console.error('Error al exportar datos:', error)
    throw new Error('Error al exportar los datos del usuario')
  }
}