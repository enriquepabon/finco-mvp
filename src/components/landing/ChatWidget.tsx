'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus en el input cuando se abre el chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Mensaje de bienvenida automático
  useEffect(() => {
    if (isOpen && messages.length === 0 && showWelcome) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: '¡Hola! 👋 Soy MentorIA, tu agente financiero personalizado impulsado por IA. Estoy aquí para ayudarte a mejorar tu salud financiera y alcanzar tus objetivos. Juntos lo lograremos. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setShowWelcome(false);
    }
  }, [isOpen, messages.length, showWelcome]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/landing/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Lo siento, hubo un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Sugerencias rápidas
  const quickSuggestions = [
    '¿Qué es MentorIA?',
    '¿Cómo funciona el registro por voz?',
    '¿Qué planes tienen?',
    '¿Cómo puedo ahorrar mejor?'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Abrir chat con MentorIA"
        >
          {/* Efecto de pulso animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 rounded-full animate-ping opacity-75"></div>
          
          {/* Botón principal con fondo blanco */}
          <div className="relative bg-white p-3 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 border-2 border-gray-100">
            {/* Logo de MentorIA usando la imagen PNG */}
            <div className="w-12 h-12 relative">
              <Image
                src="/images/logo-mentoria-icon.png"
                alt="MentorIA"
                fill
                className="object-contain"
              />
            </div>
            
            {/* Badge de "nuevo" */}
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
              💬 ¡Chatea con MentorIA!
              <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </button>
      )}

      {/* Modal del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                  <Image
                    src="/images/logo-mentoria-icon.png"
                    alt="MentorIA"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                {/* Indicador online */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">MentorIA</h3>
                <p className="text-blue-100 text-xs flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                  En línea
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white text-gray-800 shadow-md border border-gray-200'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-200">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600">MentorIA</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {isLoading && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                    <span className="text-sm text-gray-600">MentorIA está escribiendo...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sugerencias rápidas (solo si no hay mensajes del usuario) */}
            {messages.filter(m => m.role === 'user').length === 0 && !isLoading && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center mb-3">💡 Preguntas sugeridas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-600 border border-gray-200 hover:border-purple-300 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-md text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  {input.length}/500
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg disabled:hover:shadow-none"
                aria-label="Enviar mensaje"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              🔒 Tus conversaciones son privadas y seguras
            </p>
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

