// Límites de conversaciones por tier de suscripción
export const SUBSCRIPTION_LIMITS = {
  BASIC: 10,
  PREMIUM: 50,
  PRO: 200,
} as const

// Categorías de productos
export const PRODUCT_CATEGORIES = {
  PROTEIN: 'Proteínas',
  CREATINE: 'Creatina',
  PRE_WORKOUT: 'Pre-entreno',
  POST_WORKOUT: 'Post-entreno',
  VITAMINS: 'Vitaminas',
  MINERALS: 'Minerales',
  FAT_BURNER: 'Quemadores de grasa',
  AMINO_ACIDS: 'Aminoácidos',
  CARBOHYDRATES: 'Carbohidratos',
  MASS_GAINER: 'Ganadores de masa',
  OMEGA_3: 'Omega 3',
  MULTIVITAMIN: 'Multivitamínicos',
  JOINT_SUPPORT: 'Soporte articular',
  ENERGY: 'Energéticos',
  BARS_SNACKS: 'Barras y snacks',
  EQUIPMENT: 'Equipamiento',
  OTHER: 'Otros',
} as const

// Objetivos de fitness
export const FITNESS_GOALS = {
  WEIGHT_LOSS: 'Pérdida de peso',
  MUSCLE_GAIN: 'Ganancia muscular',
  STRENGTH: 'Fuerza',
  ENDURANCE: 'Resistencia',
  GENERAL_HEALTH: 'Salud general',
  COMPETITION_PREP: 'Preparación para competición',
  RECOVERY: 'Recuperación',
  FLEXIBILITY: 'Flexibilidad',
} as const

// Niveles de experiencia
export const EXPERIENCE_LEVELS = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
  PROFESSIONAL: 'Profesional',
} as const

// Niveles de actividad
export const ACTIVITY_LEVELS = {
  SEDENTARY: 'Sedentario',
  LIGHTLY_ACTIVE: 'Ligeramente activo',
  MODERATELY_ACTIVE: 'Moderadamente activo',
  VERY_ACTIVE: 'Muy activo',
  EXTREMELY_ACTIVE: 'Extremadamente activo',
} as const

// Tipos de dieta
export const DIET_TYPES = {
  OMNIVORE: 'Omnívoro',
  VEGETARIAN: 'Vegetariano',
  VEGAN: 'Vegano',
  KETO: 'Cetogénica',
  PALEO: 'Paleo',
  MEDITERRANEAN: 'Mediterránea',
  INTERMITTENT_FASTING: 'Ayuno intermitente',
  OTHER: 'Otro',
} as const

// Rate limits
export const RATE_LIMITS = {
  CHAT_PER_HOUR: 10,
  API_PER_HOUR: 60,
  SEARCH_PER_HOUR: 20,
  RECOMMENDATIONS_PER_HOUR: 15,
} as const

// URLs de APIs externas
export const EXTERNAL_APIS = {
  TAVILY: 'https://api.tavily.com/search',
  SERPER: 'https://google.serper.dev/search',
} as const

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'FitBot',
  description: 'Tu entrenador personal con inteligencia artificial',
  version: '1.0.0',
  author: 'FitBot Team',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
} as const

// Mensajes por defecto
export const DEFAULT_MESSAGES = {
  welcome: '¡Hola! Soy FitBot, tu entrenador personal con IA. ¿En qué puedo ayudarte hoy con tu fitness y nutrición?',
  error: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
  limit_reached: 'Has alcanzado tu límite de conversaciones. Considera actualizar tu plan para continuar.',
  unauthorized: 'Por favor, inicia sesión para usar el chat.',
} as const

// Configuración de productos
export const PRODUCT_CONFIG = {
  max_recommendations: 3,
  min_rating: 3.5,
  default_currency: 'EUR',
  image_placeholder: '/placeholder-product.jpg',
} as const