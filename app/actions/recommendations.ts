import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/ai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { PRODUCT_CONFIG, DEFAULT_MESSAGES } from '@/lib/constants'

// Schema para recomendaciones de productos
const RecommendationSchema = z.object({
  products: z.array(z.object({
    name: z.string(),
    category: z.string(),
    reason: z.string(),
    priority: z.number().min(1).max(10),
  })).max(3),
  explanation: z.string(),
})

// Schema para búsqueda de productos
const ProductSearchSchema = z.object({
  query: z.string().min(1).max(100),
  category: z.string().optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxPrice: z.number().positive().optional(),
})

export async function getProductRecommendations(
  userGoals?: string[],
  userMessage?: string
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  // Obtener perfil de fitness del usuario
  const fitnessProfile = await prisma.fitnessProfile.findUnique({
    where: { userId: session.user.id }
  })

  // Preparar contexto para la IA
  let context = `Usuario busca recomendaciones de productos de fitness y nutrición.`
  
  if (fitnessProfile) {
    context += `
    
Perfil del usuario:
- Objetivos: ${fitnessProfile.fitnessGoals.join(', ')}
- Nivel de experiencia: ${fitnessProfile.experience || 'No especificado'}
- Nivel de actividad: ${fitnessProfile.activityLevel || 'No especificado'}
- Tipo de dieta: ${fitnessProfile.dietType || 'No especificado'}
- Altura: ${fitnessProfile.height}cm, Peso: ${fitnessProfile.weight}kg
- Alergias: ${fitnessProfile.allergies.join(', ')}`
  }

  if (userMessage) {
    context += `\n\nMensaje del usuario: "${userMessage}"`
  }

  if (userGoals) {
    context += `\n\nObjetivos específicos: ${userGoals.join(', ')}`
  }

  try {
    const { object: recommendations } = await generateObject({
      model: openai('gpt-4-turbo-preview'),
      system: `Eres un experto en suplementos y productos de fitness. 
      Recomienda máximo 3 productos específicos que sean relevantes para el usuario.
      Cada producto debe tener una razón clara y una prioridad del 1-10.
      
      Categorías disponibles: Proteínas, Creatina, Pre-entreno, Post-entreno, Vitaminas, 
      Minerales, Quemadores de grasa, Aminoácidos, Carbohidratos, Ganadores de masa, 
      Omega 3, Multivitamínicos, Soporte articular, Energéticos, Barras y snacks, 
      Equipamiento, Otros.`,
      prompt: context,
      schema: RecommendationSchema,
    })

    // Buscar productos similares en la base de datos
    const productSuggestions = await Promise.all(
      recommendations.products.map(async (rec) => {
        const products = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: rec.name, mode: 'insensitive' } },
            ],
            rating: { gte: PRODUCT_CONFIG.min_rating },
          },
          take: 1,
          orderBy: { rating: 'desc' },
        })

        return {
          recommendation: rec,
          product: products[0] || null,
        }
      })
    )

    // Guardar recomendaciones en el historial
    await prisma.recommendation.create({
      data: {
        id: nanoid(),
        userId: session.user.id,
        products: recommendations.products.map(p => p.name),
        reason: recommendations.explanation,
      }
    })

    revalidatePath('/recommendations')

    return {
      recommendations: recommendations.products,
      explanation: recommendations.explanation,
      products: productSuggestions,
    }

  } catch (error) {
    console.error('Error al generar recomendaciones:', error)
    throw new Error('Error al generar recomendaciones de productos')
  }
}

export async function searchProducts(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  const { query, category, minRating, maxPrice } = ProductSearchSchema.parse({
    query: formData.get('query'),
    category: formData.get('category') || undefined,
    minRating: formData.get('minRating') ? Number(formData.get('minRating')) : undefined,
    maxPrice: formData.get('maxPrice') ? Number(formData.get('maxPrice')) : undefined,
  })

  const products = await prisma.product.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
          ]
        },
        // category ? { category: { equals: category as any } } : {},
        minRating ? { rating: { gte: minRating } } : {},
        maxPrice ? { price: { lte: maxPrice } } : {},
      ]
    },
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' },
    ],
    take: 20,
  })

  return products
}

export async function getRecommendationHistory() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return []
  }

  return prisma.recommendation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

// TODO: Implementar después de agregar UserProductPreference al esquema
export async function likeProduct(productId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  // Por ahora solo registramos el click
  await prisma.productClick.create({
    data: {
      userId: session.user.id,
      productId,
      clickType: 'LIKE',
    }
  })

  revalidatePath('/products')
}

export async function getFavoriteProducts() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return []
  }

  // Por ahora devolvemos productos más populares
  return prisma.product.findMany({
    where: { rating: { gte: 4.5 } },
    orderBy: { rating: 'desc' },
    take: 10,
  })
}