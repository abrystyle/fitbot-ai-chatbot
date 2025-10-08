'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/app/components/ui/dropdown-menu'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    subscriptionTier?: string
  }
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      })
    } catch (error) {
      console.error('Error during logout:', error)
      setIsLoggingOut(false)
    }
  }

  const displayName = user.name || user.email?.split('@')[0] || 'Usuario'
  const displayEmail = user.email || ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
          disabled={isLoggingOut}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                {displayName}
              </span>
              {displayEmail && (
                <span className="text-xs text-gray-500 truncate max-w-32">
                  {displayEmail}
                </span>
              )}
            </div>
            
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {displayName}
            </p>
            {displayEmail && (
              <p className="text-xs leading-none text-muted-foreground">
                {displayEmail}
              </p>
            )}
            {user.subscriptionTier && (
              <div className="pt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.subscriptionTier === 'PREMIUM' 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {user.subscriptionTier === 'PREMIUM' ? '⭐ Premium' : '🆓 Gratuito'}
                </span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => router.push('/profile')}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => router.push('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}