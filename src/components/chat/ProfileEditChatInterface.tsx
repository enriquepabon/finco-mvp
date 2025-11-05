'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageCircle, CheckCircle, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import CashbeatLogo from '../ui/CashbeatLogo';
import VoiceRecorder from './VoiceRecorder';
import DocumentUploader from './DocumentUploader';
import { formatCashbeatMessage } from '../../lib/utils/chat-utils';
import { useChatSubmit } from '../../hooks/useChatSubmit';
import { ChatMessage } from '../../types/chat';

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

interface MessageAttachment {
  type: 'voice' | 'document';
  name: string;
  content?: string;
}

export default function ProfileEditChatInterface({ onBack, className = '', action }: ProfileEditChatInterfaceProps) {
  const [user, setUser] = useState<unknown>(null);
  const [userToken, setUserToken] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showDocumentUploader, setShowDocumentUploader] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get user and profile
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();

      setUser(user);
      setUserToken(session?.access_token || '');

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setCurrentProfile(profile);
          setMessages([{
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

  // Use shared submit handler
  const { handleKeyPress } = useChatSubmit({
    onSubmit: () => handleSendMessage(),
    disabled: loading
  });

  const handleSendMessage = async (messageText?: string, attachments?: MessageAttachment[]) => {
    const finalMessage = messageText || inputMessage.trim();
    if (!finalMessage && (!attachments || attachments.length === 0)) return;
    if (loading) return;

    if (!user) {
      setError('Error: Usuario no autenticado. Por favor, inicia sesión nuevamente.');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: finalMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);
    setError('');

    try {
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
        headers: { 'Content-Type': 'application/json' },
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

      // Simulate typing delay
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);

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
    const attachments: MessageAttachment[] = [{
      type: 'voice',
      name: 'Nota de voz',
      content: transcription
    }];
    handleSendMessage(transcription, attachments);
    setShowVoiceRecorder(false);
  };

  const handleDocumentUpload = (fileName: string, content: string) => {
    const attachments: MessageAttachment[] = [{
      type: 'document',
      name: fileName,
      content: content
    }];
    handleSendMessage(`He subido el documento: ${fileName}`, attachments);
    setShowDocumentUploader(false);
  };

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-200"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Cashbeat IA</h3>
                <p className="text-xs text-gray-500">Actualización de Perfil</p>
              </div>
            </div>

            <div className="w-24"></div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Cashbeat IA</span>
                    </div>
                  )}

                  <div className={`rounded-2xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white shadow-md border border-purple-100'
                  }`}>
                    {message.role === 'assistant' ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: formatCashbeatMessage(message.content) }}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}

                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-purple-100' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md border border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 py-2">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="bg-white/80 backdrop-blur-md border-t border-purple-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Action buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              aria-pressed={showVoiceRecorder}
              aria-label="Grabar nota de voz"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-pink-200 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Nota de Voz</span>
            </button>

            <button
              onClick={() => setShowDocumentUploader(!showDocumentUploader)}
              aria-pressed={showDocumentUploader}
              aria-label="Subir documento"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-xl hover:from-blue-200 hover:to-cyan-200 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Subir Documento</span>
            </button>
          </div>

          {/* Voice recorder */}
          {showVoiceRecorder && (
            <div className="mb-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <VoiceRecorder
                onTranscriptionComplete={handleVoiceMessage}
                disabled={loading}
              />
            </div>
          )}

          {/* Document uploader */}
          {showDocumentUploader && (
            <div className="mb-3">
              <DocumentUploader
                onDocumentProcessed={handleDocumentUpload}
                onClose={() => setShowDocumentUploader(false)}
              />
            </div>
          )}

          {/* Text input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="font-medium">Enviar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
