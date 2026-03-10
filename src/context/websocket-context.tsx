import { env } from '@/env'
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react'

// Tipos
interface WebSocketMessage {
  event: string
  data: any
}

interface WebSocketContextType {
  isConnected: boolean
  sendMessage: (message: WebSocketMessage) => void
  lastMessage: WebSocketMessage | null
  subscribe: (event: string, callback: (data: any) => void) => () => void
}

// context
const WebSocketContext = createContext<WebSocketContextType | null>(null)

// URL do WebSocket
const WS_URL = env.VITE_WS_URL

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [subscribers, setSubscribers] = useState<Map<string, Set<Function>>>(new Map())

  // conectar WebSocket
  useEffect(() => {
    let socket: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      try {
        socket = new WebSocket(WS_URL)

        socket.onopen = () => {
          setIsConnected(true)
          setWs(socket)
        }

        socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)

            // atualizar última mensagem
            setLastMessage(message)

            // notificar subscribers deste evento
            const eventSubscribers = subscribers.get(message.event)
            
            if (eventSubscribers) {
              eventSubscribers.forEach(callback => {
                try {
                  callback(message.data)
                } catch (error) {
                  console.error('erro no callback do subscriber:', error)
                }
              })
            }
          } catch (error) {
            console.error('erro ao processar mensagem:', error)
          }
        }

        socket.onclose = () => {
          setIsConnected(false)
          setWs(null)
          reconnectTimeout = setTimeout(connect, 3000)
        }

        socket.onerror = (error) => {
          setIsConnected(false)
        }
      } catch (error) {
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    // cleanup
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (socket) {
        socket.close()
      }
    }
  }, [])

  // função para enviar mensagens
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message))
      } catch (error) {
        console.error('erro ao enviar mensagem:', error)
      }
    } else {
      console.warn('WebSocket não conectado, não foi possível enviar mensagem')
    }
  }, [ws])

  // função para inscrever em eventos específicos
  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    setSubscribers(prev => {
      const newMap = new Map(prev)
      const eventSubs = newMap.get(event) || new Set()
      eventSubs.add(callback)
      newMap.set(event, eventSubs)
      return newMap
    })

    // retorna função de cleanup (unsubscribe)
    return () => {
      setSubscribers(prev => {
        const newMap = new Map(prev)
        const eventSubs = newMap.get(event)
        if (eventSubs) {
          eventSubs.delete(callback)
          if (eventSubs.size === 0) {
            newMap.delete(event)
          }
        }
        return newMap
      })
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ 
      isConnected, 
      sendMessage, 
      lastMessage,
      subscribe 
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

// hook para usar o WebSocket
export function useWebSocket() {
  const context = useContext(WebSocketContext)
  
  if (!context) {
    throw new Error('useWebSocket deve ser usado dentro de WebSocketProvider')
  }
  
  return context
}

// hook para escutar eventos específicos
export function useWebSocketEvent(event: string, callback: (data: any) => void) {
  const { subscribe } = useWebSocket()

  useEffect(() => {
    const unsubscribe = subscribe(event, callback)
    return () => {
      unsubscribe()
    }
  }, [event, callback, subscribe])
}