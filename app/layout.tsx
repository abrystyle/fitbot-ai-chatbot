import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitBot - Tu Entrenador Personal con IA',
  description: 'Chatbot inteligente especializado en fitness y nutrición con recomendaciones personalizadas',
  keywords: ['fitness', 'nutrición', 'entrenamiento', 'IA', 'chatbot', 'salud'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className='max-w-7xl mx-auto px-4 py-8'>
        {children}
        </div>
        {/* <Toaster /> */}
      </body>
    </html>
  )
}