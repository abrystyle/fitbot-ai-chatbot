import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserMenu from '@/app/components/auth/user-menu'
import { Bot } from 'lucide-react'

interface AppHeaderProps {
  title?: string
  showLogo?: boolean
}

export default async function AppHeader({ title = "FitBot", showLogo = true }: AppHeaderProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          {showLogo && (
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
                {title}
              </h1>
            </div>
          )}
        </div>

        {/* Navegación central (opcional para futuras funcionalidades) */}
        <div className="flex-1 flex justify-center">
          {/* Aquí se pueden agregar tabs de navegación si es necesario */}
        </div>

        {/* Menu de usuario */}
        <div className="flex items-center gap-4">
          <UserMenu user={session.user} />
        </div>
      </div>
    </header>
  )
}