'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Bot } from 'lucide-react';
import BaseChatInterface from './BaseChatInterface';
import { useChat } from '../../hooks/useChat';

interface SpecializedChatInterfaceProps {
  onBack: () => void;
  action: 'profile' | 'expense' | 'budget' | 'goals' | 'investments' | 'general';
  title: string;
  className?: string;
  onProfileUpdate?: () => void; // Nueva prop para notificar actualizaciones de perfil
}

const API_ENDPOINTS = {
  profile: '/api/profile-edit-chat',
  expense: '/api/expense-chat',
  budget: '/api/budget-chat',
  goals: '/api/goals-chat',
  investments: '/api/investments-chat',
  general: '/api/general-chat'
};

const INITIAL_MESSAGES = {
  profile: '¡Hola! Te ayudo a editar tu perfil financiero. ¿Qué campo quieres actualizar?',
  expense: '¡Perfecto! Te ayudo a registrar un gasto. ¿Cuál fue el monto y en qué categoría?',
  budget: '¡Genial! Te ayudo con tu presupuesto. ¿Qué categoría quieres editar?',
  goals: '¡Excelente! Te ayudo a definir tus metas financieras. ¿Qué meta quieres crear?',
  investments: '¡Buena idea! Te ayudo con información sobre inversiones. ¿Qué te interesa saber?',
  general: '¡Hola! Soy tu asistente financiero. ¿En qué puedo ayudarte hoy?'
};

export default function SpecializedChatInterface({
  onBack,
  action,
  title,
  className = '',
  onProfileUpdate
}: SpecializedChatInterfaceProps) {
  const {
    messages,
    inputMessage,
    setInputMessage,
    loading,
    error,
    messagesEndRef,
    sendMessage
  } = useChat({
    apiEndpoint: API_ENDPOINTS[action],
    welcomeMessage: INITIAL_MESSAGES[action],
    includeUserToken: true,
    onProfileUpdate, // Pasar la callback al hook
    customRequestBody: (message, history) => ({
      message,
      chatHistory: history.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    })
  });

  // Custom header
  const header = (
    <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Volver</span>
      </button>

      <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-600" />
        {title}
      </h2>

      <div className="w-16" /> {/* Spacer */}
    </div>
  );

  // Custom message renderers with animations
  const renderUserMessage = (message: { content: string; timestamp: Date }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-end"
    >
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-600 text-white">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderAssistantMessage = (message: { content: string; timestamp: Date }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start"
    >
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-slate-200 text-slate-800 shadow-sm">
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderLoadingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <BaseChatInterface
      messages={messages}
      inputMessage={inputMessage}
      onInputChange={setInputMessage}
      onSendMessage={() => sendMessage()}
      loading={loading}
      error={error}
      messagesEndRef={messagesEndRef}
      header={header}
      renderUserMessage={renderUserMessage}
      renderAssistantMessage={renderAssistantMessage}
      renderLoadingIndicator={renderLoadingIndicator}
      inputPlaceholder="Escribe tu mensaje..."
      showTimestamps={false}
      className={`bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}
      inputClassName="border-t border-slate-200 bg-white/80 backdrop-blur-sm"
    />
  );
}
