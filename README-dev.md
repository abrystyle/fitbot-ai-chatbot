# 🏋️ Fitness Chatbot con Next.js 15 y IA

Una aplicación completa de chatbot especializada en fitness, nutrición y bienestar, construida con las últimas tecnologías.

## ✨ Características Principales

- 🤖 **Chat con IA especializada** en fitness, nutrición y bienestar
- 🔐 **Autenticación múltiple** (Google, GitHub, credenciales)
- 📊 **Perfiles de fitness personalizados** con objetivos y restricciones
- 🛒 **Recomendaciones de productos** con seguimiento de clics
- 🔍 **Búsqueda web autónoma** con APIs especializadas
- 💬 **Límites de conversación** por tipo de suscripción
- 📱 **Interfaz responsive** con diseño moderno

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 15+ con App Router, React 19, TypeScript 5.6+
- **Styling**: Tailwind CSS 4.0, shadcn/ui components
- **Backend**: Server Actions, Prisma 6.0, PostgreSQL 15
- **Autenticación**: NextAuth.js 5.0 con múltiples proveedores
- **IA**: Vercel AI SDK 4.0 con OpenAI GPT-4 y Claude-3.5
- **Rate Limiting**: Upstash Redis con @upstash/ratelimit
- **Búsqueda**: Tavily API y Serper API para búsqueda web
- **Validación**: Zod con React Hook Form
- **Desarrollo**: Turbopack para builds ultra-rápidos

## ⚡ Inicio Rápido (Estilo DDEV)

### Prerequisitos

- Docker y Docker Compose
- Node.js 20+ (opcional para desarrollo local)

### 1. Una sola línea para empezar

```bash
git clone <tu-repo> && cd fitness-chatbot-nextjs15 && ./dev start
```

**¡Eso es todo!** Tu aplicación estará corriendo en:
- 🌐 **Aplicación**: http://localhost:3000
- 🗄️ **Admin DB**: http://localhost:8080
- 📊 **PostgreSQL**: localhost:5432
- 🔴 **Redis**: localhost:6379

### 2. Configurar API Keys (opcional)

```bash
cp .env.example .env
# Edita .env y añade tu OPENAI_API_KEY
```

## 🛠️ Comandos de Desarrollo (Estilo DDEV)

El script `./dev` funciona como DDEV para manejar todo el entorno:

```bash
# Comandos principales
./dev start     # 🚀 Levantar todo el entorno (como ddev start)
./dev stop      # 🛑 Detener servicios (como ddev stop)
./dev restart   # 🔄 Reiniciar servicios (como ddev restart)

# Utilidades
./dev logs      # 📋 Ver logs en tiempo real
./dev db        # 🗃️  Conectar a PostgreSQL (como ddev ssh)
./dev status    # 📊 Ver estado de servicios
./dev clean     # 🧹 Limpiar todo completamente

# Ayuda
./dev help      # 📚 Ver todos los comandos disponibles
```

## 📋 Scripts NPM Adicionales

```bash
npm run dev                 # Servidor de desarrollo (solo Next.js)
npm run build              # Build para producción
npm run db:push            # Actualizar esquema de BD
npm run db:generate        # Generar Prisma Client
npm run db:studio          # Abrir Prisma Studio
npm run docker:up          # Solo levantar Docker Compose
npm run docker:down        # Solo detener Docker Compose
npm run docker:logs        # Ver logs de Docker
```

## 🏗️ Arquitectura del Proyecto

```
fitness-chatbot-nextjs15/
├── 🚀 dev                   # Script principal (como ddev)
├── 🐳 docker-compose.yml    # Orquestación de servicios
├── 📦 Dockerfile.dev        # Imagen de desarrollo
├── 
├── 📱 app/
│   ├── (auth)/              # 🔐 Rutas de autenticación
│   ├── (dashboard)/         # 🏠 Rutas protegidas (chat, perfil)
│   ├── actions/             # ⚡ Server Actions (chat, recomendaciones)
│   └── components/          # 🧩 Componentes React reutilizables
├── 
├── 🔧 lib/                  # 🛠️ Utilidades y configuración
├── 🗄️ prisma/              # 📊 Esquema de base de datos
├── 🐳 docker/              # 📜 Scripts de inicialización
└── 📚 README.md            # Este archivo
```

## 🎯 Flujo de Desarrollo

### Para nuevos desarrolladores:

```bash
# 1. Clonar proyecto
git clone <repo-url>
cd fitness-chatbot-nextjs15

# 2. Configurar environment (opcional)
cp .env.example .env
# Añadir OPENAI_API_KEY si tienes una

# 3. ¡Listo para desarrollar!
./dev start
```

### Para desarrollo día a día:

```bash
# Empezar a trabajar
./dev start

# Ver qué está pasando
./dev logs

# Conectar a la BD para inspeccionar datos
./dev db

# Terminar trabajo
./dev stop
```

## 🔧 Características de Desarrollo

### 🎛️ Docker Compose Stack
- **PostgreSQL 15**: Base de datos principal con extensiones
- **Next.js App**: Aplicación con hot reload y Turbopack
- **Redis**: Caché y rate limiting
- **Adminer**: Administrador web de base de datos

### ⚡ Server Actions
Todas las operaciones de backend usan Server Actions para:
- 💬 Operaciones CRUD de chat y perfiles
- 🤖 Integración con APIs de IA (OpenAI, Anthropic)
- 🚦 Rate limiting por usuario y suscripción
- 🎯 Recomendaciones personalizadas con ML

### 🗄️ Base de Datos
Esquema completo optimizado para fitness chatbot:
- 👥 **Usuarios** con perfiles de fitness detallados
- 💬 **Conversaciones** con límites por suscripción
- 🛍️ **Productos** con categorías y seguimiento de clics
- 📊 **Analytics** de interacciones y recomendaciones

### 🔐 Autenticación
NextAuth.js 5.0 con soporte completo para:
- 🌐 Google OAuth
- 🐙 GitHub OAuth  
- 🔑 Credenciales con bcrypt
- 🎫 Sesiones JWT y database

## 🌍 Variables de Entorno

### Requeridas
- `DATABASE_URL`: String de conexión PostgreSQL
- `NEXTAUTH_SECRET`: Secreto para NextAuth.js
- `NEXTAUTH_URL`: URL base de la aplicación

### Opcionales para IA
- `OPENAI_API_KEY`: Para GPT-4 (recomendado)
- `ANTHROPIC_API_KEY`: Para Claude-3.5 (alternativo)

### Opcionales para OAuth
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`

### Opcionales para búsqueda web
- `TAVILY_API_KEY`: Para búsqueda web avanzada
- `SERPER_API_KEY`: Para búsqueda alternativa

## 🚢 Despliegue

### Desarrollo
```bash
./dev start  # ¡Listo!
```

### Producción
```bash
npm run build
npm start
# O usar Docker Compose con target production
```

## 🤝 Contribuir

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 🆘 Resolución de Problemas

### La aplicación no inicia
```bash
./dev clean  # Limpia todo
./dev start  # Reinicia desde cero
```

### Problemas de base de datos
```bash
./dev db     # Conecta para inspeccionar
npm run db:studio  # Abre interfaz visual
```

### Ver logs detallados
```bash
./dev logs   # Logs de todos los servicios
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

**💡 Tip**: Usa `./dev help` para ver todos los comandos disponibles en cualquier momento.