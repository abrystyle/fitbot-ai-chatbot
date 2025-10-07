import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-2xl font-bold">🤖</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900">
              Fit<span className="text-blue-600">Bot</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tu entrenador personal con inteligencia artificial. Obtén consejos personalizados sobre 
            fitness, nutrición y recomendaciones de productos para alcanzar tus objetivos.
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <Link 
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Comenzar Ahora
            </Link>
            <Link 
              href="/register"
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Crear Cuenta
            </Link>
          </div>

          {/* Características */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Entrenamientos Personalizados</h3>
              <p className="text-gray-600">
                Rutinas diseñadas específicamente para tus objetivos y nivel de experiencia.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold mb-2">Nutrición Inteligente</h3>
              <p className="text-gray-600">
                Planes alimenticios adaptados a tus restricciones y metas de fitness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">💊</div>
              <h3 className="text-xl font-bold mb-2">Recomendaciones de Productos</h3>
              <p className="text-gray-600">
                Sugerencias inteligentes de suplementos basadas en tu perfil.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Respuestas en Tiempo Real</h3>
              <p className="text-gray-600">
                Chat en tiempo real que responde todas tus dudas sobre fitness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Búsqueda Web Autónoma</h3>
              <p className="text-gray-600">
                Acceso a información actualizada y científicamente respaldada.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">IA Especializada</h3>
              <p className="text-gray-600">
                Entrenada específicamente en fitness con años de experiencia simulada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}