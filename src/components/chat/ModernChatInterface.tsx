'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import CashbeatLogo from '../ui/CashbeatLogo';
import { useChat } from '../../hooks/useChat';
import { useChatSubmit } from '../../hooks/useChatSubmit';
import { formatCashbeatMessage, formatTime } from '@/lib/utils/chat-utils';
import { ChatMessage } from '../../types/chat';

interface ModernChatInterfaceProps {
  onComplete?: () => void;
  className?: string;
}

export default function ModernChatInterface({ onComplete, className = '' }: ModernChatInterfaceProps) {
  const [user, setUser] = useState<unknown>(null);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  const MAX_QUESTIONS = 9;

  const {
    messages,
    inputMessage,
    setInputMessage,
    loading,
    error,
    progress: rawProgress,
    isCompleted,
    messagesEndRef,
    sendMessage: baseSendMessage
  } = useChat({
    apiEndpoint: '/api/chat',
    welcomeMessage: '¡Hola! 👋 Soy Cashbeat IA, tu coach financiero personal. \n\nTe haré exactamente **9 preguntas básicas** para conocer tu perfil financiero y que puedas empezar a crear tu presupuesto. Será rápido y enfocado.\n\n¿Cómo te llamas?',
    maxQuestions: MAX_QUESTIONS,
    onComplete: () => {
      onComplete?.();
      router.push('/dashboard');
    },
    includeUserToken: true
  });

  // Calculate progress as percentage
  const progress = (rawProgress / MAX_QUESTIONS) * 100;

  // Get user on mount for validation
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Wrapped send message with typing animation delay
  const handleSendMessage = async () => {
    if (!user) {
      return;
    }

    setIsTyping(true);

    // Use base sendMessage from useChat hook
    await baseSendMessage();

    // Simulate typing delay before showing response
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const { handleKeyPress } = useChatSubmit({
    onSubmit: handleSendMessage,
    disabled: loading || isCompleted
  });

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden ${className}`}>
      {/* Glassmorphism Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-blue-100/30 to-purple-100/20 backdrop-blur-sm"></div>
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-white/30 p-6 shadow-lg"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-md"
            >
              <CashbeatLogo variant="chat" size="small" />
            </motion.div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Cashbeat IA</h1>
              <p className="text-sm text-gray-600">Tu coach financiero personal</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
            <div className="w-32 h-3 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-500 bg-white/50 backdrop-blur-sm rounded-full p-1"
              >
                <CheckCircle className="w-5 h-5" />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message: ChatMessage, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.role === 'assistant' ? (
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 hover:border-white/60 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-1 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                          <CashbeatLogo variant="chat" size="small" />
                        </div>
                        <span className="font-semibold text-gray-900">Cashbeat IA</span>
                        {message.timestamp && (
                          <span className="text-xs text-gray-500 ml-auto bg-gray-100/50 px-2 py-1 rounded-full">
                            {formatTime(message.timestamp)}
                          </span>
                        )}
                      </div>
                      <div 
                        className="text-gray-800 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: formatCashbeatMessage(message.content) 
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-3xl p-6 shadow-xl"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-white leading-relaxed font-medium">{message.content}</p>
                        {message.timestamp && (
                          <span className="text-xs text-blue-100 ml-3 flex-shrink-0 bg-white/20 px-2 py-1 rounded-full">
                            {formatTime(message.timestamp)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-1 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                      <CashbeatLogo variant="chat" size="small" />
                    </div>
                    <span className="font-semibold text-gray-900">Cashbeat IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                      />
                    ))}
                    <span className="ml-3 text-sm text-gray-600 font-medium">escribiendo...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 py-3 relative z-10"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-100/80 backdrop-blur-xl border border-red-200/50 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
                {error}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/70 backdrop-blur-xl border-t border-white/30 p-6 shadow-lg"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={loading ? "Cashbeat IA está pensando..." : "Escribe tu respuesta..."}
                disabled={loading || isCompleted}
                className="w-full bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white resize-none transition-all duration-300 placeholder-gray-500 shadow-lg text-gray-900 font-medium"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
              {inputMessage.trim() && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSendMessage}
                  disabled={loading || isCompleted}
                  className="absolute right-3 bottom-3 w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span className="font-medium">Presiona Enter para enviar</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 