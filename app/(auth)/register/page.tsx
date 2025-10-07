import { signIn } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SignupSchema } from '@/lib/validations'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import Link from 'next/link'
import { Chrome, Github } from 'lucide-react'
import bcrypt from 'bcryptjs'

export default function RegisterPage() {
  async function handleRegister(formData: FormData) {
    'use server'
    
    try {
      const data = SignupSchema.parse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
      })

      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (existingUser) {
        throw new Error('Un usuario con este email ya existe')
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(data.password, 12)

      // Crear usuario
      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash
        }
      })

      // Iniciar sesión automáticamente después del registro
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirectTo: '/chat'
      })
    } catch (error) {
      console.error('Error en registro:', error)
      // Aquí podrías manejar errores específicos
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">
            Únete a FitBot y comienza tu transformación fitness personalizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Registro con credenciales */}
          <form action={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre completo"
                required
              />
            </div>
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
                placeholder="Crea una contraseña segura"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full">
              Crear Cuenta
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

          {/* Registro con proveedores OAuth */}
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
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="underline">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}