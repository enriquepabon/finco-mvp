'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MessageCircle, DollarSign, Target, TrendingUp, Bot, ArrowLeft, Receipt, Edit3, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BRAND_NAME } from '@/lib/constants/mentoria-brand';
import SpecializedChatInterface from './SpecializedChatInterface';
import InteractiveBudgetChat from '../budget/InteractiveBudgetChat';
import TransactionModal from '../transactions/TransactionModal';
import VoiceTransactionModal from '../transactions/VoiceTransactionModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { createClient } from '@supabase/supabase-js';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AdvancedChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: () => void; // Nueva prop para notificar actualizaciones
}

const CHAT_OPTIONS = [
  {
    id: 'register-transaction',
    icon: Receipt,
    title: 'Registrar transacción',
    description: 'Agrega ingresos o gastos a tu presupuesto',
    color: 'from-red-500 to-red-600',
    isParent: true
  },
  {
    id: 'expense',
    icon: Receipt,
    title: '  • Registro manual',
    description: 'Formulario rápido para ingresar detalles',
    color: 'from-red-500 to-red-600',
    isChild: true
  },
  {
    id: 'voice-expense',
    icon: Mic,
    title: '  • Registro por voz',
    description: 'Usa tu voz para registrar gastos',
    color: 'from-pink-500 to-rose-600',
    isChild: true
  },
  {
    id: 'edit-budget',
    icon: Edit3,
    title: 'Editar tu presupuesto',
    description: 'Modifica categorías y montos de tu presupuesto',
    color: 'from-amber-500 to-amber-600'
  },
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

export default function AdvancedChatModal({ isOpen, onClose, onProfileUpdate }: AdvancedChatModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [activeBudgetId, setActiveBudgetId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Focus trap for accessibility
  const focusTrapRef = useFocusTrap(isOpen);

  // 🆕 Obtener el presupuesto activo del usuario
  useEffect(() => {
    if (isOpen) {
      loadActiveBudget();
    }
  }, [isOpen]);

  const loadActiveBudget = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener el presupuesto del mes actual
      const currentDate = new Date();
      const { data: budget } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('budget_month', currentDate.getMonth() + 1)
        .eq('budget_year', currentDate.getFullYear())
        .eq('status', 'active')
        .maybeSingle();

      if (budget) {
        setActiveBudgetId(budget.id);
        console.log('✅ Budget activo cargado:', budget.id);
      } else {
        console.log('⚠️ No se encontró presupuesto activo para este mes');
      }
    } catch (error) {
      console.error('❌ Error cargando presupuesto activo:', error);
    }
  };

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
    // Redirigir según la opción seleccionada
    switch (optionId) {
      case 'register-transaction':
        // Solo expandir/colapsar submenú
        // Si ya está seleccionado, colapsar. Si no, expandir.
        setSelectedOption(selectedOption === 'register-transaction' ? null : 'register-transaction');
        break;
      case 'expense':
        // Abrir modal de transacciones directamente (mantener el menú expandido)
        setShowTransactionModal(true);
        break;
      case 'voice-expense':
        // Abrir modal de registro por voz (mantener el menú expandido)
        setShowVoiceModal(true);
        break;
      case 'edit-budget':
        // Mostrar interfaz de edición de presupuesto
        setSelectedOption('edit-budget');
        break;
      case 'profile':
        // No cerrar el modal, mostrar el chat de edición de perfil
        setSelectedOption('profile');
        break;
      case 'budget':
        // Mostrar la nueva experiencia interactiva de presupuesto
        setSelectedOption('budget');
        break;
      case 'goals':
      case 'investments':
        // Estas opciones aún no están implementadas, mostrar chat general
        setSelectedOption('general');
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `¡Hola! Soy ${BRAND_NAME}, tu mentor financiero personal. ${optionId === 'goals' ? 'Las metas financieras' : 'La asesoría en inversiones'} está en desarrollo, pero puedo ayudarte con consejos generales de finanzas. ¿En qué puedo ayudarte hoy?`,
          timestamp: new Date()
        }]);
        break;
      case 'general':
        setSelectedOption('general');
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `¡Hola! Soy ${BRAND_NAME}, tu mentor financiero personal. ¿En qué puedo ayudarte hoy? Puedo darte consejos sobre presupuestos, ahorros, inversiones básicas, o cualquier duda financiera que tengas.`,
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
    setShowTransactionModal(false);
    setShowVoiceModal(false);
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
            ref={focusTrapRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden border border-white/20"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2E5BFF]/10 to-[#00C48C]/10 p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center p-1">
                    <Image
                      src="/images/logo-mentoria-icon.png"
                      alt={BRAND_NAME}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <h3 id="modal-title" className="font-bold text-gray-800">{BRAND_NAME}</h3>
                    <p className="text-sm text-gray-600">Tu mentor financiero</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Cerrar modal"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {!selectedOption || selectedOption === 'register-transaction' ? (
                // Options Menu
                <div className="p-6 h-full overflow-y-auto">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">¿En qué puedo ayudarte?</h4>
                  <div className="space-y-3">
                    {CHAT_OPTIONS
                      .filter(option => {
                        // Mostrar opciones padre siempre
                        if (!option.isChild) return true;
                        // Mostrar opciones hijo solo si el padre está seleccionado
                        return selectedOption === 'register-transaction';
                      })
                      .map((option) => {
                      const IconComponent = option.icon;
                      
                      return (
                        <motion.button
                          key={option.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionSelect(option.id)}
                          className={`w-full p-4 rounded-xl bg-gradient-to-r bg-white/80 hover:bg-white/90 border border-gray-200/50 text-left transition-all duration-200 group ${
                            option.isChild ? 'ml-4 border-l-4' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center text-white ${
                              option.isChild ? 'w-8 h-8' : ''
                            }`}>
                              <IconComponent size={option.isChild ? 16 : 20} />
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-medium text-gray-800 group-hover:text-gray-900 ${
                                option.isChild ? 'text-sm' : ''
                              }`}>{option.title}</h5>
                              <p className={`text-sm text-gray-600 mt-1 ${
                                option.isChild ? 'text-xs' : ''
                              }`}>{option.description}</p>
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
                  onProfileUpdate={onProfileUpdate}
                />
              ) : selectedOption === 'edit-budget' ? (
                // Budget Edit Chat
                <SpecializedChatInterface 
                  onBack={handleBackToMenu}
                  action="budget"
                  title="Editar Presupuesto"
                  className="h-full"
                />
              ) : selectedOption === 'budget' ? (
                // Interactive Budget Creation
                <InteractiveBudgetChat 
                  onBack={handleBackToMenu}
                  onComplete={(budgetData) => {
                    console.log('✅ Presupuesto creado:', budgetData);
                    // Aquí puedes agregar lógica adicional, como mostrar confirmación
                    // o redirigir al presupuesto creado
                    handleBackToMenu();
                  }}
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
                      <label htmlFor="modal-chat-input" className="sr-only">
                        Escribe tu mensaje
                      </label>
                      <input
                        id="modal-chat-input"
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe tu mensaje..."
                        aria-label="Escribe tu mensaje"
                        className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/80"
                        disabled={loading}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={loading || !inputMessage.trim()}
                        aria-label="Enviar mensaje"
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

      {/* Modal de Transacciones */}
      {showTransactionModal && (
        <TransactionModal
          key="transaction-modal"
          isOpen={showTransactionModal}
          budgetId={activeBudgetId}
          onClose={() => {
            setShowTransactionModal(false);
            // Mantener el menú expandido (register-transaction)
          }}
          onSuccess={() => {
            setShowTransactionModal(false);
            // Cerrar completamente después de éxito
            setSelectedOption(null);
            if (onProfileUpdate) {
              onProfileUpdate(); // Recargar datos si es necesario
            }
          }}
        />
      )}

      {/* Modal de Registro por Voz */}
      {showVoiceModal && (
        <VoiceTransactionModal
          key="voice-modal"
          isOpen={showVoiceModal}
          budgetId={activeBudgetId}
          onClose={() => {
            setShowVoiceModal(false);
            // Mantener el menú expandido (register-transaction)
          }}
          onSuccess={() => {
            setShowVoiceModal(false);
            // Cerrar completamente después de éxito
            setSelectedOption(null);
            if (onProfileUpdate) {
              onProfileUpdate(); // Recargar datos si es necesario
            }
          }}
        />
      )}
    </AnimatePresence>
  );
} 