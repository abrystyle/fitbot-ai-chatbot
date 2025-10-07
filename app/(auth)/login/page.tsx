import { signIn } from '@/lib/auth'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import Link from 'next/link'
import { Chrome, Github } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Accede a FitBot y continúa con tu entrenamiento personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Login con credenciales */}
          <form
            action={async (formData) => {
              'use server'
              await signIn('credentials', {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                redirectTo: '/chat'
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Tu contraseña"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          {/* Login con proveedores OAuth */}
          <div className="grid grid-cols-2 gap-4">
            <form
              action={async () => {
                'use server'
                await signIn('google', { redirectTo: '/chat' })
              }}
            >
              <Button variant="outline" className="w-full" type="submit">
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
            </form>

            <form
              action={async () => {
                'use server'
                await signIn('github', { redirectTo: '/chat' })
              }}
            >
              <Button variant="outline" className="w-full" type="submit">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </form>
          </div>

          <div className="text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="underline">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}