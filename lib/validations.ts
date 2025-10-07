import { z } from 'zod'

// Schemas para validación de datos

export const UserProfileSchema = z.object({
  age: z.number().min(13).max(120).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  weight: z.number().min(30).max(300).optional(),
  height: z.number().min(100).max(250).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE']).optional(),
  fitnessGoals: z.array(z.enum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 'GENERAL_HEALTH', 'COMPETITION_PREP', 'RECOVERY', 'FLEXIBILITY'])),
  workoutDays: z.number().min(0).max(7).optional(),
  experience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']).optional(),
  injuries: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  dietType: z.enum(['OMNIVORE', 'VEGETARIAN', 'VEGAN', 'KETO', 'PALEO', 'MEDITERRANEAN', 'INTERMITTENT_FASTING', 'OTHER']).optional(),
  budget: z.number().min(0).optional(),
  preferredBrands: z.array(z.string()).default([])
})

export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
})

export const ProductRecommendationSchema = z.object({
  conversationContext: z.string(),
  userGoals: z.array(z.string()),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  budget: z.number().optional(),
  restrictions: z.array(z.string()).optional()
})

export const SearchSchema = z.object({
  query: z.string().min(1),
  context: z.string().optional(),
  maxResults: z.number().max(10).default(5)
})

export const SignupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100)
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

// Tipos derivados
export type UserProfile = z.infer<typeof UserProfileSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type ProductRecommendation = z.infer<typeof ProductRecommendationSchema>
export type SearchQuery = z.infer<typeof SearchSchema>
export type SignupData = z.infer<typeof SignupSchema>
export type LoginData = z.infer<typeof LoginSchema>