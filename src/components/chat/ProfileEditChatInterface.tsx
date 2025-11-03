'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageCircle, CheckCircle, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import CashbeatLogo from '../ui/CashbeatLogo';
import VoiceRecorder from './VoiceRecorder';
import DocumentUploader from './DocumentUploader';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'voice' | 'document';
    name: string;
    content?: string;
  }>;
}

interface UserProfile {
  full_name?: string;
  age?: number;
  civil_status?: string;
  children_count?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_savings?: number;
}

interface ProfileEditChatInterfaceProps {
  onBack: () => void;
  className?: string;
  action?: string;
}

export default function ProfileEditChatInterface({ onBack, className = '', action }: ProfileEditChatInterfaceProps) {
  const [user, setUser] = useState<any>(null);
  const [userToken, setUserToken] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Obtener usuario y perfil actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      setUser(user);
      setUserToken(session?.access_token || '');

      if (user) {
        // Obtener perfil actual
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setCurrentProfile(profile);
          // Mensaje inicial del asistente
          setMessages([{
            id: '1',
            role: 'assistant',
            content: `¡Hola ${profile.full_name || ''}! 👋 Soy Cashbeat IA y estoy aquí para ayudarte a actualizar tu perfil financiero.

**Puedes comunicarte conmigo de múltiples formas:**
🎙️ **Grabando una nota de voz** - Simplemente habla y te entenderé
📎 **Subiendo documentos** - Arrastra archivos PDF, Word o texto con tu información financiera
✍️ **Escribiendo directamente** - Dime qué quieres actualizar

**Ejemplos de lo que puedes decir o escribir:**
• "Quiero actualizar mis ingresos a 25 millones"
• "Mis gastos ahora son 20 millones" 
• "Tengo nuevos activos por 15 millones"
• "Quiero cambiar mi edad a 40 años"

¿O prefieres que revisemos todos tus datos paso a paso? 

¿Qué te gustaría actualizar hoy?`,
            timestamp: new Date()
          }]);
        }
      }
    };
    getUser();
  }, []);

  const formatCashbeatMessage = (content: string) => {
    if (!content || typeof content !== 'string') {
      return '';
    }
    
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 font-semibold">$1</strong>')
      .replace(/([¿?][^¿?]*[¿?])/g, '<strong class="text-blue-700 block mt-3 mb-2">$1</strong>')
      .replace(/(¿Sabías que[^.]*\.)/g, '<div class="bg-yellow-50 border-l-4 border-yellow-400 p-2 my-2 text-yellow-800"><em>💡 $1</em></div>')
      .replace(/^([🎯🤖💰📊💪🔥👋🎙️📎✍️•]+)\\s/gm, '<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2 mb-1">$1</span>')
      .replace(/\\n/g, '<br>');
  };

  const handleSendMessage = async (messageText?: string, attachments?: Array<{type: 'voice' | 'document', name: string, content?: string}>) => {
    const finalMessage = messageText || inputMessage.trim();
    if (!finalMessage && (!attachments || attachments.length === 0)) return;
    if (loading) return;

    // Validar que tenemos usuario
    if (!user) {
      setError('Error: Usuario no autenticado. Por favor, inicia sesión nuevamente.');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: finalMessage,
      timestamp: new Date(),
      attachments: attachments
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);
    setError('');

    try {
      // Preparar el contexto completo para el API
      let fullContext = finalMessage;
      
      if (attachments && attachments.length > 0) {
        const attachmentContext = attachments.map(att => {
          if (att.type === 'voice') {
            return `[Nota de voz transcrita]: ${att.content || att.name}`;
          } else if (att.type === 'document') {
            return `[Documento: ${att.name}]: ${att.content || 'Contenido del documento procesado'}`;
          }
          return '';
        }).join('\n\n');
        
        fullContext = attachmentContext + (finalMessage ? `\n\nMensaje adicional: ${finalMessage}` : '');
      }

      const response = await fetch('/api/profile-edit-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: fullContext,
          chatHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userToken: userToken,
          currentProfile: currentProfile,
          attachments: attachments
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el mensaje');
      }
      
      // Simular typing delay
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);

        // Actualizar perfil local si hubo cambios
        if (data.updatedProfile) {
          setCurrentProfile(data.updatedProfile);
        }
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error al enviar el mensaje. Inténtalo de nuevo.');
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceMessage = (transcription: string, audioBlob?: Blob) => {
    const attachments = [{
      type: 'voice' as const,
      name: 'Nota de voz',
      content: transcription
    }];
    handleSendMessage('', attachments);
  };

  const handleDocumentUpload = (fileName: string, content: string) => {
    const attachments = [{
      type: 'document' as const,
      name: fileName,
      content: content
    }];
    handleSendMessage('', attachments);
  };

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
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/70 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <CashbeatLogo variant="chat" size="small" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Editar Perfil Financiero</h1>
              <p className="text-sm text-gray-600">Voz, documentos o texto - ¡Tú eliges!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">{currentProfile?.full_name || 'Usuario'}</span>
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 mt-1">
                  <CashbeatLogo variant="chat" size="small" />
                </div>
              )}
              
              <div className={`max-w-2xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-600">Cashbeat IA</span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                
                <motion.div 
                  whileHover={{ y: -2 }}
                  className={`rounded-3xl p-6 shadow-xl border transition-all duration-300 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-200'
                      : 'bg-white/80 backdrop-blur-xl text-gray-800 border-white/40 hover:border-white/60 hover:shadow-2xl'
                  }`}
                >
                  {/* Mostrar attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {message.attachments.map((attachment, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${
                          message.role === 'user' ? 'bg-white/20' : 'bg-blue-50'
                        }`}>
                          <span className="text-sm">
                            {attachment.type === 'voice' ? '🎙️' : '📎'}
                          </span>
                          <span className={`text-xs ${
                            message.role === 'user' ? 'text-white/80' : 'text-gray-600'
                          }`}>
                            {attachment.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.role === 'assistant' ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatCashbeatMessage(message.content) }}
                    />
                  ) : (
                    <p className="text-white">{message.content}</p>
                  )}
                </motion.div>
              </div>

              {message.role === 'user' && (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ml-3 mt-1">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 mt-1">
                  <CashbeatLogo variant="chat" size="small" />
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/40">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-600 ml-2">Cashbeat está procesando...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with Multimodal Controls */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/70 backdrop-blur-xl border-t border-white/30 p-6"
      >
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex gap-4 items-end">
            {/* Voice Recorder */}
            <VoiceRecorder
              onTranscriptionComplete={handleVoiceMessage}
              disabled={loading}
            />
            
            {/* Document Uploader */}
            <DocumentUploader
              onDocumentProcessed={handleDocumentUpload}
              disabled={loading}
            />
            
            {/* Text Input */}
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Escribe aquí, graba tu voz o sube un documento..."
                disabled={loading}
                className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none min-h-[60px] max-h-[120px]"
                rows={2}
              />
            </div>
            
            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              ) : (
                <Send className="w-6 h-6" />
              )}
            </motion.button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            🎙️ Graba tu voz • 📎 Sube documentos • ✍️ Escribe tu mensaje • Enter para enviar
          </p>
        </div>
      </motion.div>
    </div>
  );
} 