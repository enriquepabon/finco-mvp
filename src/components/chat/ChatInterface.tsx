'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../../lib/gemini/client';
import { supabase } from '../../../lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ChatInterfaceProps {
  onComplete?: () => void;
  className?: string;
}

// Función para formatear mensajes de FINCO con mejor diseño
const formatFincoMessage = (content: string) => {
  return content
    // Convertir preguntas en negrita
    .replace(/([¿?][^¿?]*[¿?])/g, '<strong class="text-blue-700 block mt-3 mb-2">$1</strong>')
    // Convertir datos curiosos en destacado
    .replace(/(¿Sabías que[^.]*\.)/g, '<div class="bg-yellow-50 border-l-4 border-yellow-400 p-2 my-2 text-yellow-800"><em>💡 $1</em></div>')
    // Convertir citas en destacado
    .replace(/(Como decía [^:]*: "[^"]*")/g, '<div class="bg-blue-50 border-l-4 border-blue-400 p-2 my-2 text-blue-800"><em>📚 $1</em></div>')
    // Convertir emojis al inicio en badges
    .replace(/^([🎯🤖💰📊💪🔥]+)\s/gm, '<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2 mb-1">$1</span>')
    // Saltos de línea
    .replace(/\n/g, '<br>');
};

export default function ChatInterface({ onComplete, className = '' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const MAX_QUESTIONS = 9;

  // Auto-scroll al final cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
              content: '¡Hola! 👋 Soy FINCO, tu coach financiero personal. \n\nTe haré exactamente **9 preguntas básicas** para conocer tu perfil financiero y que puedas empezar a crear tu presupuesto. Será rápido y enfocado.\n\n¿Cómo te llamas?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Agregar mensaje del usuario
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      // Obtener el token de sesión
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          chatHistory: messages,
          userToken: session.access_token
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Agregar respuesta de FINCO
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        
        // Actualizar progreso (cada intercambio usuario-FINCO cuenta como progreso)
        const newProgress = Math.min(Math.floor(newMessages.length / 2), MAX_QUESTIONS);
        setProgress(newProgress);
        
        // Verificar si se completó el onboarding
        if (newProgress >= MAX_QUESTIONS && !isCompleted) {
          setIsCompleted(true);
          // Auto-redirigir al dashboard después de 3 segundos
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
        
        return newMessages;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error al enviar mensaje. Por favor intenta de nuevo.');
      
      // Mensaje de error de FINCO
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Lo siento, tuve un problema técnico. ¿Podrías intentar enviar tu mensaje de nuevo?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-lg font-bold">
              F
            </div>
            <div>
              <h3 className="font-semibold">FINCO</h3>
              <p className="text-sm text-blue-200">Tu coach financiero personal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">Progreso</p>
            <p className="text-sm font-semibold">{progress}/{MAX_QUESTIONS}</p>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-blue-800 rounded-full h-2">
          <div 
            className="bg-green-400 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(progress / MAX_QUESTIONS) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] lg:max-w-[80%] rounded-lg shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white px-4 py-3'
                  : 'bg-white border border-gray-200 p-4'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xs">F</span>
                    </div>
                    <span className="font-semibold text-green-700 text-sm">FINCO</span>
                  </div>
                  <div 
                    className="text-gray-800 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: formatFincoMessage(message.content) 
                    }}
                  />
                  {message.timestamp && (
                    <p className="text-xs text-gray-400 mt-2">
                      {formatTime(message.timestamp)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.timestamp && (
                    <p className="text-xs text-blue-200 mt-2">
                      {formatTime(message.timestamp)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !inputMessage.trim() || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Enviar'
            )}
          </button>
        </div>
      </div>

      {/* Complete Message */}
      {isCompleted && (
        <div className="border-t border-green-200 p-4 bg-green-50">
          <div className="text-center">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="font-semibold text-green-800 mb-1">¡Perfil Básico Completado!</h3>
            <p className="text-sm text-green-600 mb-3">
              Perfecto, ya tienes tu perfil básico listo. Ahora puedes crear tu presupuesto personalizado.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Redirigiendo al dashboard...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 