'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { useVoiceConversation } from '../../hooks/useVoiceConversation';

interface ConversationalVoiceInterfaceProps {
  agentName?: string;
  initialMessage?: string;
  onUserMessage: (message: string) => Promise<string>; // Retorna respuesta del agente
  onClose?: () => void;
  className?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ConversationalVoiceInterface({
  agentName = 'MentorIA',
  initialMessage = '¡Hola! Soy MentorIA, tu coach personal de presupuestos. ¿Listo para empezar?',
  onUserMessage,
  onClose,
  className = ''
}: ConversationalVoiceInterfaceProps) {
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(true);
  const hasSpokenInitialRef = useRef(false);

  const {
    isListening,
    isSpeaking,
    currentTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    interrupt
  } = useVoiceConversation({
    onUserSpeech: handleUserSpeech,
    autoSpeak: true,
    language: 'es-CO'
  });

  // Función para manejar lo que dice el usuario
  async function handleUserSpeech(transcript: string) {
    console.log('👤 Usuario dijo:', transcript);
    
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Obtener respuesta del agente
      const agentResponse = await onUserMessage(transcript);
      
      // Agregar mensaje del agente
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: agentResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Hacer que el agente hable la respuesta
      speak(agentResponse, {
        rate: 1.0, // Velocidad normal para mejor compatibilidad
        onEnd: () => {
          console.log('✅ Agente terminó de hablar');
        }
      });
      
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, tuve un problema. ¿Podrías repetir?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      speak('Lo siento, tuve un problema. ¿Podrías repetir?');
    } finally {
      setIsProcessing(false);
    }
  }

  // Iniciar conversación con el primer click del usuario
  const startConversation = useCallback(() => {
    if (!hasSpokenInitialRef.current && isSupported && initialMessage) {
      hasSpokenInitialRef.current = true;
      setNeedsUserInteraction(false);
      
      // Agregar mensaje inicial
      const initialMsg: Message = {
        id: 'initial',
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      };
      
      setMessages([initialMsg]);
      
      // Esperar un momento para asegurar que el DOM esté listo
      setTimeout(() => {
        console.log('🎤 Iniciando conversación con voz...');
        speak(initialMessage, {
          rate: 1.0,
          onEnd: () => {
            console.log('✅ Mensaje inicial hablado');
            setHasStarted(true);
          }
        });
      }, 300);
    }
  }, [isSupported, initialMessage, speak]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) {
        interrupt(); // Interrumpir si está hablando
      } else {
        startListening();
      }
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 ${className}`}>
        <div className="max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Navegador No Compatible
          </h2>
          <p className="text-slate-600 mb-6">
            La conversación por voz requiere Chrome, Edge o Safari. Por favor, usa uno de estos navegadores.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Volver al Chat por Texto
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mostrar pantalla de inicio que requiere interacción del usuario
  if (needsUserInteraction) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 ${className}`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md p-10 bg-white rounded-3xl shadow-2xl text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg">
            {agentName[0]}
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            {agentName}
          </h2>
          <p className="text-slate-600 mb-8 text-lg leading-relaxed">
            Estoy listo para conversar contigo por voz. Haz click en el botón para empezar.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startConversation}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg flex items-center gap-3 mx-auto"
          >
            <Mic className="w-6 h-6" />
            Iniciar Conversación
          </motion.button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Usar Modo Texto</span>
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 ${className}`}>
      {/* Header */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {agentName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{agentName}</h1>
              <p className="text-sm text-slate-600">
                {isSpeaking ? '🔊 Hablando...' : isListening ? '🎙️ Escuchando...' : '💬 Conversación activa'}
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Modo Texto</span>
            </button>
          )}
        </div>
      </div>

      {/* Conversación - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-slate-800 border-2 border-purple-200'
                  }`}
                >
                  <p className="text-base leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Indicador de procesamiento */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-purple-500 rounded-full"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-500 rounded-full"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-500 rounded-full"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-slate-600 text-sm">Pensando...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Transcripción en tiempo real */}
      {currentTranscript && isListening && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border-t border-blue-200"
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-blue-600 mb-1">Escuchando...</p>
            <p className="text-slate-800">{currentTranscript}</p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border-t border-red-200"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-red-600 font-medium">{error}</p>
                {error.includes('conexión') && (
                  <p className="text-sm text-red-500 mt-1">
                    Sugerencia: Intenta recargar la página o cambiar a modo texto.
                  </p>
                )}
              </div>
              {error.includes('conexión') && (
                <button
                  onClick={() => window.location.reload()}
                  className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Recargar
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Controles Principales */}
      <div className="p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-6">
            
            {/* Botón de Micrófono Principal */}
            <motion.button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {isListening ? (
                <>
                  <MicOff className="w-8 h-8 text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-red-300"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </>
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </motion.button>

            {/* Botón Detener Voz */}
            {isSpeaking && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={toggleSpeaking}
                className="w-16 h-16 bg-slate-500 hover:bg-slate-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <VolumeX className="w-6 h-6" />
              </motion.button>
            )}
          </div>

          {/* Instrucciones */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-slate-600">
              {isListening ? (
                <span className="font-medium text-red-600">🎙️ Habla ahora...</span>
              ) : isSpeaking ? (
                <span className="font-medium text-purple-600">🔊 {agentName} está hablando...</span>
              ) : (
                <span>Presiona el micrófono para hablar</span>
              )}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

