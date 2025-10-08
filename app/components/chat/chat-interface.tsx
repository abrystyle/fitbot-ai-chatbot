'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { readStreamableValue, StreamableValue } from '@ai-sdk/rsc'
import { AssistantMessage } from './assistant-message'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

interface StreamResult {
  conversationId: string
  messageStream: StreamableValue<string>
}

interface ChatInterfaceProps {
  conversationId?: string
  initialMessages?: Message[]
  sendMessageAction: (formData: FormData) => Promise<StreamResult>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      type="submit" 
      size="icon"
      disabled={pending}
      className="shrink-0"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </Button>
  )
}

export default function ChatInterface({ conversationId, initialMessages = [], sendMessageAction }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [currentResponse, setCurrentResponse] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentResponse])

  async function handleSubmit(formData: FormData) {
    const message = formData.get('message') as string
    if (!message.trim()) return

    // Agregar mensaje del usuario inmediatamente
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      createdAt: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsGenerating(true)
    setCurrentResponse('')

    // Limpiar el formulario
    formRef.current?.reset()

    try {
      // Agregar conversationId al FormData si existe
      if (conversationId) {
        formData.append('conversationId', conversationId)
      }

      // Llamar a la Server Action y obtener el stream
      const result = await sendMessageAction(formData)
      
      // Leer el stream de la respuesta de IA usando readStreamableValue
      if (result && typeof result === 'object' && 'messageStream' in result) {
        let fullResponse = ''
        
        for await (const delta of readStreamableValue(result.messageStream)) {
          if (delta) {
            fullResponse = delta as string
            setCurrentResponse(delta as string)
          }
        }
        
        // Al finalizar el stream, agregar mensaje completo y limpiar estado
        const assistantMessage: Message = {
          id: Date.now().toString() + '_assistant',
          content: fullResponse,
          role: 'assistant',
          createdAt: new Date(),
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setCurrentResponse('')
      }

    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        content: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
        role: 'assistant',
        createdAt: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-4 ">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            FitBot - Tu Entrenador Personal con IA
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pregúntame sobre fitness, nutrición, rutinas de ejercicio y recomendaciones de productos
          </p>
        </CardHeader>
      </Card>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1">
        {messages.length === 0 && !currentResponse && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-medium mb-2">¡Hola! Soy FitBot 💪</h3>
                <p className="text-sm">
                  Estoy aquí para ayudarte con tu fitness y nutrición. Puedes preguntarme sobre:
                </p>
                {/* <ul className="text-sm grid grid-row-2 grid-cols-2 mt-2 space-y-2 space-x-2 list-none">
                  <li className='border border-gray-200 px-4 py-8'>Rutinas de ejercicios personalizadas</li>
                  <li className='border border-gray-200 px-4 py-8'>Consejos de nutrición y dietas</li>
                  <li className='border border-gray-200 px-4 py-8'>Recomendaciones de suplementos</li>
                  <li className='border border-gray-200 px-4 py-8'>Planificación de entrenamientos</li>
                </ul> */}
              </div>
            </CardContent>
          </Card>
        )}

        {messages.map((message) => (
          <div key={message.id} className="flex gap-3">
            <Avatar className="shrink-0">
              <AvatarFallback>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4 text-blue-500" />
                )}
              </AvatarFallback>
            </Avatar>
            
            <Card className={`flex-1 relative ${
              message.role === 'user' 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-gray-50'
            }`}>
              <CardContent className="pt-3 pb-3">
                {message.role === 'assistant' ? (
                  <AssistantMessage content={message.content} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                <span
                  className="absolute top-2 right-6 text-xs text-gray-400 text-muted-foreground"
                  style={{ marginTop: '0.25rem' }}
                >
                  {message.createdAt.toLocaleTimeString()}
                </span>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Respuesta en tiempo real */}
        {currentResponse && (
          <div className="flex gap-3">
            <Avatar className="shrink-0">
              <AvatarFallback>
                <Bot className="h-4 w-4 text-blue-500" />
              </AvatarFallback>
            </Avatar>
            
            <Card className="flex-1 bg-gray-50">
              <CardContent className="pt-3 pb-3">
                <AssistantMessage content={currentResponse} />
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  <span className="text-xs text-muted-foreground">Escribiendo...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form ref={formRef} action={handleSubmit} className="flex gap-2 p-4">
          <Input
            name="message"
            placeholder="Escribe tu pregunta sobre fitness o nutrición..."
            disabled={isGenerating}
            className="flex-1"
            autoComplete="off"
          />
          <SubmitButton />
        </form>
      </div>
    </div>
  )
}