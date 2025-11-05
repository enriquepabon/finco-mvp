'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MessageCircle, DollarSign, Target, TrendingUp, Bot, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CashbeatLogo from '../ui/CashbeatLogo';
import SpecializedChatInterface from './SpecializedChatInterface';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AdvancedChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHAT_OPTIONS = [
  {
    id: 'profile',
    icon: User,
    title: 'Editar tu perfil financiero',
    description: 'Actualiza tu información personal y financiera',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'budget',
    icon: DollarSign,
    title: 'Crear un nuevo presupuesto',
    description: 'Planifica tus gastos e ingresos mensualmente',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'goals',
    icon: Target,
    title: 'Crear tus metas financieras',
    description: 'Define objetivos de ahorro e inversión',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'investments',
    icon: TrendingUp,
    title: 'Asesoría en inversiones',
    description: 'Aprende sobre opciones de inversión básicas',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'general',
    icon: MessageCircle,
    title: 'Asesoría general en finanzas',
    description: 'Conversa libremente sobre tus finanzas',
    color: 'from-cyan-500 to-cyan-600'
  }
];

export default function AdvancedChatModal({ isOpen, onClose }: AdvancedChatModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Escape key handler for accessibility
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    
    // Redirigir según la opción seleccionada
    switch (optionId) {
      case 'profile':
        // No cerrar el modal, mostrar el chat de edición de perfil
        setSelectedOption('profile');
        break;
      case 'budget':
        onClose();
        router.push('/budget/create');
        break;
      case 'goals':
      case 'investments':
        // Estas opciones aún no están implementadas, mostrar chat general
        setSelectedOption('general');
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `¡Hola! Soy Cashbeat IA, tu asistente financiero personal. ${optionId === 'goals' ? 'Las metas financieras' : 'La asesoría en inversiones'} está en desarrollo, pero puedo ayudarte con consejos generales de finanzas. ¿En qué puedo ayudarte hoy?`,
          timestamp: new Date()
        }]);
        break;
      case 'general':
        setMessages([{
          id: '1',
          role: 'assistant',
          content: '¡Hola! Soy Cashbeat IA, tu asistente financiero personal. ¿En qué puedo ayudarte hoy? Puedo darte consejos sobre presupuestos, ahorros, inversiones básicas, o cualquier duda financiera que tengas.',
          timestamp: new Date()
        }]);
        break;
    }
  };

  const handleBackToMenu = () => {
    setSelectedOption(null);
    setMessages([]);
    setInputMessage('');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Simular respuesta de IA (aquí se conectaría con el API real)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Gracias por tu mensaje. Esta funcionalidad está en desarrollo. Pronto podrás tener conversaciones completas conmigo sobre tus finanzas personales.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleClose = () => {
    setSelectedOption(null);
    setMessages([]);
    setInputMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                    <CashbeatLogo variant="chat" size="small" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Cashbeat IA</h3>
                    <p className="text-sm text-gray-600">Tu asistente financiero</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {!selectedOption ? (
                // Options Menu
                <div className="p-6 h-full overflow-y-auto">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">¿En qué puedo ayudarte?</h4>
                  <div className="space-y-3">
                    {CHAT_OPTIONS.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <motion.button
                          key={option.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionSelect(option.id)}
                          className="w-full p-4 rounded-xl bg-gradient-to-r bg-white/80 hover:bg-white/90 border border-gray-200/50 text-left transition-all duration-200 group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center text-white`}>
                              <IconComponent size={20} />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800 group-hover:text-gray-900">{option.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : selectedOption === 'profile' ? (
                // Profile Edit Chat Interface
                <SpecializedChatInterface 
                  onBack={handleBackToMenu}
                  action="profile"
                  title="Editar Perfil Financiero"
                  className="h-full"
                />
              ) : selectedOption === 'expense' ? (
                // Expense Registration Chat
                <SpecializedChatInterface 
                  onBack={handleBackToMenu}
                  action="expense"
                  title="Registrar Gasto"
                  className="h-full"
                />
              ) : selectedOption === 'budget' ? (
                // Budget Edit Chat
                <SpecializedChatInterface 
                  onBack={handleBackToMenu}
                  action="budget"
                  title="Editar Presupuesto"
                  className="h-full"
                />
              ) : selectedOption === 'goals' ? (
                // Goals Chat
                <SpecializedChatInterface 
                  onBack={handleBackToMenu}
                  action="goals"
                  title="Crear Metas Financieras"
                  className="h-full"
                />
              ) : selectedOption === 'investments' ? (
                // Investments Chat
                <SpecializedChatInterface 
                  onBack={handleBackToMenu}
                  action="investments"
                  title="Información de Inversiones"
                  className="h-full"
                />
              ) : (
                // General Chat Interface
                <div className="h-full flex flex-col">
                  {/* Back Button */}
                  <div className="p-4 border-b border-gray-200/50">
                    <button
                      onClick={handleBackToMenu}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span>Volver al menú</span>
                    </button>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/80 text-gray-800 border border-gray-200/50'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white/80 rounded-2xl p-3 border border-gray-200/50">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200/50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/80"
                        disabled={loading}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={loading || !inputMessage.trim()}
                        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 