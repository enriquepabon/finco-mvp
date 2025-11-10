'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Sparkles, 
  User, 
  CreditCard, 
  Target, 
  TrendingUp, 
  MessageCircle,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react'
import FincoAvatar, { type FincoExpression } from '@/components/ui/FincoAvatar'

interface Message {
  id: string
  type: 'user' | 'finco'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface ActionBubble {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  action: string
  color: string
  gradient: string
}

interface FincoGlassmorphismChatProps {
  isOpen?: boolean
  onClose?: () => void
  onMinimize?: () => void
  initialMessage?: string
  mode?: 'floating' | 'fullscreen' | 'embedded'
}

export default function FincoGlassmorphismChat({
  isOpen = true,
  onClose,
  onMinimize,
  initialMessage = "¡Hola! Soy MentorIA, tu asistente financiero personal. ¿En qué puedo ayudarte hoy?",
  mode = 'floating'
}: FincoGlassmorphismChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'finco',
      content: initialMessage,
      timestamp: new Date()
    }
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [fincoExpression, setFincoExpression] = useState<FincoExpression>('idle')
  const [showActionBubbles, setShowActionBubbles] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Burbujas de acción principales
  const actionBubbles: ActionBubble[] = [
    {
      id: 'profile',
      icon: <User className="w-5 h-5" />,
      title: 'Editar perfil financiero',
      description: 'Actualiza tu información personal y financiera',
      action: 'edit_profile',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
    },
    {
      id: 'budget',
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Crear nuevo presupuesto',
      description: 'Planifica tus ingresos y gastos mensuales',
      action: 'create_budget',
      color: 'from-emerald-500 to-green-500',
      gradient: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20'
    },
    {
      id: 'goals',
      icon: <Target className="w-5 h-5" />,
      title: 'Crear metas financieras',
      description: 'Define y sigue tus objetivos de ahorro',
      action: 'create_goals',
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
    },
    {
      id: 'investments',
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Asesoría en inversiones',
      description: 'Aprende sobre opciones de inversión básicas',
      action: 'investment_advice',
      color: 'from-orange-500 to-red-500',
      gradient: 'bg-gradient-to-r from-orange-500/20 to-red-500/20'
    },
    {
      id: 'general',
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Asesoría general',
      description: 'Pregúntame cualquier cosa sobre finanzas',
      action: 'general_advice',
      color: 'from-indigo-500 to-blue-500',
      gradient: 'bg-gradient-to-r from-indigo-500/20 to-blue-500/20'
    }
  ]

  // Auto-scroll al final de mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simular respuesta de MentorIA
  const simulateFincoResponse = async (userMessage: string, action?: string) => {
    setIsTyping(true)
    setFincoExpression('thinking')
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let response = ''
    
    if (action) {
      switch (action) {
        case 'edit_profile':
          response = "¡Perfecto! Te ayudo a actualizar tu perfil financiero. Te voy a redirigir al dashboard donde podrás editar toda tu información personal y financiera de forma segura."
          break
        case 'create_budget':
          response = "¡Excelente decisión! Crear un presupuesto es fundamental para el control financiero. ¿Prefieres que te guíe paso a paso con preguntas, o quieres usar nuestro template manual?"
          break
        case 'create_goals':
          response = "¡Me encanta que pienses en metas! Definir objetivos financieros claros es clave para el éxito. Esta funcionalidad estará disponible muy pronto. Por ahora, ¿te gustaría que hablemos sobre qué tipo de metas tienes en mente?"
          break
        case 'investment_advice':
          response = "Las inversiones pueden ser una excelente forma de hacer crecer tu dinero. Como asesor responsable, primero necesito conocer tu perfil de riesgo y situación financiera. ¿Ya tienes un fondo de emergencia establecido?"
          break
        case 'general_advice':
          response = "¡Estoy aquí para ayudarte con cualquier pregunta financiera! Puedo asesorarte sobre presupuestos, ahorro, deudas, planificación financiera, y mucho más. ¿Qué tema te interesa más?"
          break
        default:
          response = "Entiendo tu consulta. ¿Podrías darme más detalles para poder ayudarte mejor?"
      }
    } else {
      response = `Gracias por tu mensaje: "${userMessage}". Como tu asesor financiero, estoy aquí para ayudarte. ¿En qué aspecto específico de tus finanzas te gustaría que te apoye?`
    }
    
    setFincoExpression('speaking')
    
    const fincoMessage: Message = {
      id: Date.now().toString(),
      type: 'finco',
      content: response,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, fincoMessage])
    setIsTyping(false)
    setFincoExpression('idle')
  }

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setShowActionBubbles(false)
    
    await simulateFincoResponse(inputValue)
  }

  // Manejar acción de burbuja
  const handleBubbleAction = async (bubble: ActionBubble) => {
    const actionMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: bubble.title,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, actionMessage])
    setShowActionBubbles(false)
    
    await simulateFincoResponse(bubble.title, bubble.action)
  }

  // Manejar grabación de voz
  const toggleRecording = () => {
    setIsRecording(!isRecording)
    setFincoExpression(isRecording ? 'idle' : 'listening')
    
    if (!isRecording) {
      // Simular inicio de grabación
      setTimeout(() => {
        setIsRecording(false)
        setInputValue('Mensaje de voz convertido a texto...')
        setFincoExpression('idle')
      }, 3000)
    }
  }

  // Estilos condicionales según el modo
  const containerStyles = {
    floating: "fixed bottom-6 right-6 w-96 h-[600px] z-50",
    fullscreen: "fixed inset-0 z-50",
    embedded: "w-full h-full"
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: isMinimized ? 0.3 : 1, 
        y: isMinimized ? 200 : 0 
      }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`${containerStyles[mode]} ${isMinimized ? 'pointer-events-none' : ''}`}
    >
      {/* Contenedor principal con glassmorphism */}
      <div className="h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header del chat */}
        <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar MentorIA */}
              <div className="relative">
                <FincoAvatar
                  expression={fincoExpression}
                  size="small"
                  isAnimating={isTyping || isRecording}
                />
                {/* Indicador de estado */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800">MentorIA</h3>
                <p className="text-sm text-gray-600">
                  {isTyping ? 'Escribiendo...' : isRecording ? 'Escuchando...' : 'Tu asesor financiero IA'}
                </p>
              </div>
            </div>
            
            {/* Controles del header */}
            <div className="flex items-center gap-2">
              {mode === 'floating' && (
                <>
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
              {/* Burbujas de acción (solo al inicio) */}
              <AnimatePresence>
                {showActionBubbles && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3 mb-6"
                  >
                    <p className="text-sm text-gray-600 text-center mb-4">
                      ¿En qué puedo ayudarte hoy?
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {actionBubbles.map((bubble) => (
                        <motion.button
                          key={bubble.id}
                          onClick={() => handleBubbleAction(bubble)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            p-3 rounded-xl border border-white/20 
                            ${bubble.gradient} backdrop-blur-sm
                            hover:bg-white/30 transition-all duration-200
                            text-left group
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${bubble.color} text-white`}>
                              {bubble.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 group-hover:text-gray-900">
                                {bubble.title}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {bubble.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mensajes del chat */}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-2xl backdrop-blur-sm
                      ${message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white/20 border border-white/20 text-gray-800'
                      }
                    `}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Indicador de escritura */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/20 backdrop-blur-sm border border-white/20 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border-t border-white/20">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleRecording}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-white/20 hover:bg-white/30 text-gray-700'
                    }
                  `}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-700" />
                </button>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu mensaje..."
                    className="
                      w-full px-4 py-2 bg-white/20 backdrop-blur-sm 
                      border border-white/20 rounded-xl
                      placeholder-gray-500 text-gray-800
                      focus:outline-none focus:border-blue-500/50 focus:bg-white/30
                      transition-all duration-200
                    "
                    disabled={isRecording}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isRecording}
                  className="
                    p-2 bg-gradient-to-r from-blue-500 to-cyan-500 
                    hover:from-blue-600 hover:to-cyan-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-white rounded-lg transition-all duration-200
                    transform hover:scale-105 active:scale-95
                  "
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
} 