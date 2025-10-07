import { auth } from '@/lib/auth'
import { z } from 'zod'
import { DEFAULT_MESSAGES, EXTERNAL_APIS } from '@/lib/constants'

// Schema para búsqueda web
const WebSearchSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(['fitness', 'nutrition', 'products', 'general']).optional(),
})

interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
}

interface SearchResponse {
  results: SearchResult[]
  query: string
  totalResults?: number
}

// Rate limiting para búsquedas
const searchRateLimit = new Map<string, { count: number; resetTime: number }>()

function checkSearchRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = searchRateLimit.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    searchRateLimit.set(userId, { count: 1, resetTime: now + 60 * 60 * 1000 }) // 1 hora
    return true
  }

  if (userLimit.count >= 20) { // 20 búsquedas por hora
    return false
  }

  userLimit.count++
  return true
}

// Búsqueda con Tavily API
async function searchWithTavily(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(EXTERNAL_APIS.TAVILY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        max_results: 5,
        topic: 'general',
      }),
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()
    
    return data.results?.map((result: any) => ({
      title: result.title || 'Sin título',
      url: result.url || '',
      snippet: result.content || result.snippet || 'Sin descripción disponible',
      source: new URL(result.url || '').hostname || 'Fuente desconocida',
    })) || []

  } catch (error) {
    console.error('Error en búsqueda Tavily:', error)
    throw error
  }
}

// Búsqueda con Serper API (backup)
async function searchWithSerper(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(EXTERNAL_APIS.SERPER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.SERPER_API_KEY || '',
      },
      body: JSON.stringify({
        q: query,
        num: 5,
      }),
    })

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`)
    }

    const data = await response.json()
    
    return data.organic?.map((result: any) => ({
      title: result.title || 'Sin título',
      url: result.link || '',
      snippet: result.snippet || 'Sin descripción disponible',
      source: new URL(result.link || '').hostname || 'Fuente desconocida',
    })) || []

  } catch (error) {
    console.error('Error en búsqueda Serper:', error)
    throw error
  }
}

// Búsqueda básica con Google (fallback)
async function searchWithGoogle(query: string): Promise<SearchResult[]> {
  // Esta es una implementación básica que solo formatea la URL
  // En un entorno de producción, necesitarías usar Google Custom Search API
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`
  
  return [{
    title: 'Búsqueda en Google',
    url: googleUrl,
    snippet: `Haz clic para buscar "${query}" en Google`,
    source: 'google.com',
  }]
}

export async function performWebSearch(formData: FormData): Promise<SearchResponse> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error(DEFAULT_MESSAGES.unauthorized)
  }

  // Rate limiting
  if (!checkSearchRateLimit(session.user.id)) {
    throw new Error('Límite de búsquedas por hora alcanzado')
  }

  const { query, type } = WebSearchSchema.parse({
    query: formData.get('query'),
    type: formData.get('type') || 'general',
  })

  // Mejorar la consulta basándose en el tipo
  let enhancedQuery = query
  if (type === 'fitness') {
    enhancedQuery = `${query} fitness ejercicio entrenamiento`
  } else if (type === 'nutrition') {
    enhancedQuery = `${query} nutrición dieta alimentación saludable`
  } else if (type === 'products') {
    enhancedQuery = `${query} suplementos productos fitness comprar`
  }

  let results: SearchResult[] = []
  // Intentar con Tavily primero
  if (process.env.TAVILY_API_KEY) {
    try {
      results = await searchWithTavily(enhancedQuery)
    } catch (error) {
      console.error('Tavily search failed:', error)
    }
  }

  // Si falla Tavily, intentar con Serper
  if (results.length === 0 && process.env.SERPER_API_KEY) {
    try {
      results = await searchWithSerper(enhancedQuery)
    } catch (error) {
      console.error('Serper search failed:', error)
    }
  }

  // Como último recurso, usar búsqueda básica de Google
  if (results.length === 0) {
    results = await searchWithGoogle(enhancedQuery)
  }

  // Filtrar y limpiar resultados
  const cleanResults = results
    .filter(result => result.url && result.title)
    .slice(0, 5)
    .map(result => ({
      ...result,
      snippet: result.snippet.slice(0, 200) + (result.snippet.length > 200 ? '...' : ''),
    }))

  return {
    results: cleanResults,
    query: enhancedQuery,
    totalResults: cleanResults.length,
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  const session = await auth()
  
  if (!session?.user?.id) {
    return []
  }

  // Sugerencias predefinidas basadas en fitness y nutrición
  const suggestions: Record<string, string[]> = {
    'proteina': [
      'proteína whey para principiantes',
      'proteína vegana vs animal',
      'cuánta proteína necesito al día',
      'mejores marcas de proteína',
    ],
    'creatina': [
      'creatina monohidrato efectos',
      'cuándo tomar creatina',
      'creatina y ganancia muscular',
      'creatina efectos secundarios',
    ],
    'ejercicio': [
      'rutina de ejercicios para principiantes',
      'ejercicios para perder peso',
      'ejercicios de fuerza en casa',
      'ejercicios para ganar músculo',
    ],
    'dieta': [
      'dieta para ganar músculo',
      'dieta para perder peso',
      'dieta vegetariana fitness',
      'dieta cetogénica y ejercicio',
    ],
  }

  const queryLower = query.toLowerCase()
  
  for (const [key, values] of Object.entries(suggestions)) {
    if (queryLower.includes(key)) {
      return values
    }
  }

  // Sugerencias genéricas si no hay coincidencias
  return [
    `${query} para principiantes`,
    `${query} beneficios`,
    `${query} como usar`,
    `mejores ${query}`,
  ]
}