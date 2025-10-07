'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { MessageSquare, Plus, Trash2, Calendar, Clock } from 'lucide-react'
import { createNewConversationAction, deleteConversationAction } from '@/app/actions/sidebar'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Conversation {
  id: string
  title: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    messages: number
  }
}

interface ConversationSidebarProps {
  conversations: Conversation[]
  currentConversationId?: string
  onSelectConversation: (conversationId: string) => void
}

export default function ConversationSidebar({ 
  conversations, 
  currentConversationId,
  onSelectConversation 
}: ConversationSidebarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleNewConversation = async () => {
    setIsLoading(true)
    try {
      await createNewConversationAction()
    } catch (error) {
      console.error('Error al crear nueva conversación:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return
    }

    setDeletingId(conversationId)
    
    try {
      await deleteConversationAction(conversationId)
    } catch (error) {
      console.error('Error al eliminar conversación:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es
    })
  }

  return (
    <div className="w-80 border-r bg-gray-50/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Conversaciones
          </h2>
          <Button
            onClick={handleNewConversation}
            disabled={isLoading}
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No tienes conversaciones aún</p>
            <p className="text-xs mt-1">Crea tu primera conversación</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentConversationId === conversation.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate mb-1">
                      {conversation.title || 'Nueva conversación'}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(conversation.updatedAt)}
                      </div>
                      
                      {conversation._count?.messages && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {conversation._count.messages} msg
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        conversation.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          conversation.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        {conversation.status === 'ACTIVE' ? 'Activa' : 'Archivada'}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    disabled={deletingId === conversation.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="p-4 border-t bg-white text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>FitBot AI</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Tiempo real
          </div>
        </div>
      </div>
    </div>
  )
}