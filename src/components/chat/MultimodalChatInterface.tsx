'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../../../lib/gemini/client';
import { supabase } from '../../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  X, 
  CheckCircle, 
  ArrowRight,
  Upload,
  FileText,
  Image as ImageIcon,
  User,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceRecorderFixed from './VoiceRecorderFixed';
import DocumentUploader from './DocumentUploader';
import DynamicFormComponentFixed, { StructuredData } from '../ui/DynamicFormComponentFixed';
import { parseStructuredData, validateStructuredData } from '../../../lib/parsers/structured-parser';
import MonthSelector from '../ui/MonthSelector';

interface MultimodalChatInterfaceProps {
  onComplete?: () => void;
  className?: string;
  chatType?: 'onboarding' | 'general' | 'budget';
}

interface ExtendedChatMessage extends ChatMessage {
  id: string;
  timestamp: Date;
  attachments?: {
    type: 'voice' | 'document' | 'image';
    fileName?: string;
    fileType?: string;
    content?: string;
  }[];
}

// Función para formatear mensajes de FINCO con mejor diseño
const formatFincoMessage = (content: string) => {
  return content
    .replace(/([¿?][^¿?]*[¿?])/g, '<strong class="text-blue-700 block mt-3 mb-2">$1</strong>')
    .replace(/(¿Sabías que[^.]*\.)/g, '<div class="bg-yellow-50 border-l-4 border-yellow-400 p-2 my-2 text-yellow-800"><em>💡 $1</em></div>')
    .replace(/(Como decía [^:]*: "[^"]*")/g, '<div class="bg-blue-50 border-l-4 border-blue-400 p-2 my-2 text-blue-800"><em>📚 $1</em></div>')
    .replace(/^([🎯🤖💰📊💪🔥]+)\s/gm, '<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2 mb-1">$1</span>')
    .replace(/\n/g, '<br>');
};

export default function MultimodalChatInterface({ 
  onComplete, 
  className = '',
  chatType = 'general'
}: MultimodalChatInterfaceProps) {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showDocumentUploader, setShowDocumentUploader] = useState(false);
  const [attachments, setAttachments] = useState<ExtendedChatMessage['attachments']>([]);
  
  // Estados para formularios estructurados
  const [showStructuredForm, setShowStructuredForm] = useState(false);
  const [currentFormType, setCurrentFormType] = useState<string>('');
  const [structuredData, setStructuredData] = useState<StructuredData | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Estados para selector de mes (solo para budget chat)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [budgetId, setBudgetId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Configuración dinámica según tipo de chat
  const MAX_QUESTIONS = chatType === 'onboarding' ? 9 : (chatType === 'budget' ? 4 : 999);

  // Auto-scroll al final cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to get updated token
  const getValidToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  // Detectar tipo de formulario basado en la respuesta de FINCO
  const detectFormType = (fincoMessage: string): string | null => {
    const lowerMessage = fincoMessage.toLowerCase();
    
    if (lowerMessage.includes('ingreso') && lowerMessage.includes('mensual')) {
      return 'income';
    } else if (lowerMessage.includes('gastos fijos')) {
      return 'fixed_expenses';
    } else if (lowerMessage.includes('gastos variables')) {
      return 'variable_expenses';
    } else if (lowerMessage.includes('desglosar') || lowerMessage.includes('subcategoría')) {
      return 'subcategories';
    } else if (lowerMessage.includes('ahorrar') || lowerMessage.includes('ahorro')) {
      return 'savings';
    }
    
    return null;
  };

  // Manejar cambios en datos estructurados usando useCallback para evitar bucles
  const handleStructuredDataChange = useCallback((data: StructuredData) => {
    setStructuredData(data);
  }, []);

  // Manejar envío de datos estructurados (SIMPLIFICADO)
  const handleStructuredSubmit = async (data: StructuredData) => {
    try {
      setLoading(true);
      
      // Crear mensaje descriptivo del usuario
      const userMessage = `Datos completados:\n${data.entries.map(entry => {
        const name = entry.subcategory ? 
          `${entry.category} - ${entry.subcategory}` : 
          entry.category;
        return `• ${name}: $${Number(entry.amount).toLocaleString('es-CO')}`;
      }).join('\n')}`;
      
      // Agregar mensaje del usuario
      addMessage({
        role: 'user',
        content: userMessage
      });

      // Enviar datos estructurados
      await sendStructuredMessage(data);
      
      // Ocultar formulario
      setShowStructuredForm(false);
      setCurrentFormType('');
      
    } catch (error) {
      console.error('❌ Error enviando datos estructurados:', error);
      setError('Error al procesar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Mapear tipo de formulario según número de pregunta
  const getFormTypeForQuestion = (questionNumber: number): string => {
    switch (questionNumber) {
      case 1: return 'income';
      case 2: return 'fixed_expenses';
      case 3: return 'variable_expenses';
      case 4: return 'savings';
      default: return '';
    }
  };

  // Enviar datos estructurados al API
  const sendStructuredMessage = async (data: StructuredData) => {
    const validToken = await getValidToken();
    if (!validToken) {
      throw new Error('Token de autenticación no válido');
    }

    const apiEndpoint = chatType === 'budget' ? '/api/budget-chat' : '/api/chat';

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: JSON.stringify(data), // Enviar datos estructurados como string
        chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
        userToken: validToken,
        chatType,
        isStructuredData: true, // Flag para indicar que son datos estructurados
        period: { month: selectedMonth, year: selectedYear }, // Incluir período seleccionado
        ...(chatType === 'budget' && { questionNumber: progress || 1 })
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error ${response.status}: ${errorData.error || 'Error del servidor'}`);
    }

    const responseData = await response.json();

    // Actualizar progreso ANTES de agregar mensaje
    if (chatType === 'budget' && responseData.questionNumber !== undefined) {
      const newProgress = responseData.questionNumber;
      
      // Capturar budgetId si está disponible
      if (responseData.budgetId) {
        setBudgetId(responseData.budgetId);
      }

      // Si está completo, mostrar completado
      if (responseData.isComplete) {
        addMessage({
          role: 'assistant',
          content: responseData.message || '¡Felicitaciones! Has completado tu presupuesto exitosamente. 🎉'
        });
        
        setProgress(newProgress);
        setIsCompleted(true);
        return; // No continuar con más preguntas
      } else {
        // Mostrar análisis de IA si está disponible
        if (responseData.message) {
          addMessage({
            role: 'assistant',
            content: responseData.message
          });
        }
        
        // Mostrar siguiente formulario automáticamente
        const nextFormType = getFormTypeForQuestion(newProgress);
        if (nextFormType) {
          setTimeout(() => {
            setCurrentFormType(nextFormType);
            setShowStructuredForm(true);
            setStructuredData(null);
          }, 2000); // Pausa más larga para leer el análisis
        }
      }
      
      setProgress(newProgress);
    } else {
      // Para otros tipos de chat
      addMessage({
        role: 'assistant',
        content: responseData.message || responseData.fincoResponse || 'Respuesta procesada exitosamente.'
      });
    }
  };

  // Verificar autenticación
  useEffect(() => {
    const checkUser = async () => {
      const token = await getValidToken();
      if (!token) {
        console.error('No hay sesión válida');
      }
    };
    checkUser();
  }, []);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      setMessages([{
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [chatType]);

  // Inicializar chat automáticamente para budget
  useEffect(() => {
    if (chatType === 'budget' && messages.length === 0) {
      console.log('🏦 Iniciando chat de presupuesto automáticamente...');
      
      // Mensaje inicial de FINCO
      const initialMessage: ExtendedChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '¡Hola! Vamos a crear tu presupuesto de manera estructurada. Empecemos con tus **INGRESOS MENSUALES**. Usa la tabla para organizar todos tus ingresos por categoría y subcategoría.',
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
      setProgress(1);
      
      // Mostrar formulario de ingresos automáticamente
      setCurrentFormType('income');
      setShowStructuredForm(true);
    }
  }, [chatType, messages.length]);

  const resetConversation = () => {
    setMessages([]);
    setProgress(1);
    setIsCompleted(false);
    setInputMessage('');
    setAttachments([]);
    
    // Agregar mensaje inicial
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: getWelcomeMessage()
      });
    }, 100);
  };

  const getWelcomeMessage = () => {
    switch (chatType) {
      case 'onboarding':
        return '¡Hola! Soy FINCO, tu analista financiero personal con IA. 📊\n\nVoy a realizar un **análisis completo de tu situación financiera** con 9 preguntas estratégicas. Al final tendrás:\n\n✅ **Diagnóstico financiero personalizado**\n✅ **Indicadores clave calculados**\n✅ **Recomendaciones específicas**\n✅ **Plan de acción financiero**\n\nPuedes responder escribiendo, grabando tu voz 🎙️, o subiendo documentos financieros 📄.\n\n🎯 **Empezemos: ¿Cuál es tu nombre completo?**';
      case 'budget':
        return '¡Perfecto! Soy FINCO y te ayudaré a crear tu presupuesto personalizado. Puedes contarme sobre tus ingresos y gastos hablando, escribiendo, o subiendo documentos financieros. ¿Cómo prefieres comenzar?';
      default:
        return '¡Hola! Soy FINCO, tu coach financiero personal con IA. Puedo ayudarte con presupuestos, análisis financiero, metas de ahorro y más. Puedes hablar conmigo por voz, texto, o subir documentos. ¿En qué puedo ayudarte hoy?';
    }
  };

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addMessage = (message: Omit<ExtendedChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ExtendedChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessage = async (content: string, attachments?: ExtendedChatMessage['attachments']) => {
    if (!content.trim() && !attachments?.length) return;

    setError('');
    setLoading(true);

    // Agregar mensaje del usuario
    const userMessage = addMessage({
      role: 'user',
      content: content || '[Mensaje con archivos adjuntos]',
      attachments
    });

    try {
      // Preparar contexto para la IA
      let contextualContent = content;
      
      // Agregar contenido de archivos adjuntos al contexto
      if (attachments?.length) {
        const attachmentContext = attachments
          .map(att => `[${att.type.toUpperCase()}: ${att.fileName || 'archivo'}] ${att.content || ''}`)
          .join('\n');
        contextualContent = `${content}\n\nArchivos adjuntos:\n${attachmentContext}`;
      }

      // Obtener token actualizado antes de la petición
      const validToken = await getValidToken();
      if (!validToken) {
        throw new Error('Token de autenticación no válido');
      }

      // Enviar a la API - usar la API correcta según el tipo de chat
      const apiEndpoint = chatType === 'budget' ? '/api/budget-chat' : '/api/chat';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: contextualContent,
          chatHistory: messages.map(m => ({ // TODO el historial para contar correctamente las preguntas
            role: m.role,
            content: m.content
          })),
          userToken: validToken,
          chatType,
          hasAttachments: !!attachments?.length,
          attachments,
          // Agregar questionNumber para presupuestos
          ...(chatType === 'budget' && { questionNumber: progress || 1 })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error en API:', response.status, errorData);
        throw new Error(`Error ${response.status}: ${errorData.error || 'Error del servidor'}`);
      }

      const responseData = await response.json();

      // Agregar respuesta de FINCO
      addMessage({
        role: 'assistant',
        content: responseData.message || 'Lo siento, no pude procesar tu mensaje.'
      });

      // Detectar si necesitamos mostrar un formulario estructurado (solo para budget chat)
      if (chatType === 'budget') {
        const fincoMessage = responseData.message || '';
        const formType = detectFormType(fincoMessage);
        
        if (formType) {
          console.log('🎯 Formulario estructurado detectado:', formType);
          setCurrentFormType(formType);
          setShowStructuredForm(true);
          setStructuredData(null); // Reset data
        }
      }

      // Actualizar progreso si es onboarding o presupuesto
      if ((chatType === 'onboarding' && responseData.debug?.questionNumber !== undefined) ||
          (chatType === 'budget' && responseData.questionNumber !== undefined)) {
        
        const currentProgress = chatType === 'onboarding' 
          ? responseData.debug.questionNumber 
          : responseData.questionNumber;
        
        setProgress(currentProgress);
        
        // Verificar si está completado (por número de preguntas O por flag de completado)
        const isCompleted = chatType === 'onboarding' 
          ? (currentProgress >= MAX_QUESTIONS || responseData.debug.onboardingCompleted)
          : (currentProgress >= MAX_QUESTIONS || responseData.isComplete);
        
        if (isCompleted) {
          setIsCompleted(true);
          setTimeout(() => {
            onComplete?.();
            if (chatType === 'budget' && responseData.budgetId) {
              router.push(`/dashboard/budget/${responseData.budgetId}`);
            } else {
              router.push('/dashboard');
            }
          }, 3000); // 3 segundos para que el usuario vea el mensaje final
        }
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setError('Error enviando mensaje. Intenta de nuevo.');
      
      addMessage({
        role: 'assistant',
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !inputMessage.trim()) return;

    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const handleVoiceTranscription = async (transcription: string) => {
    if (transcription.trim()) {
      await sendMessage(transcription, [{
        type: 'voice',
        content: transcription
      }]);
    }
    setShowVoiceRecorder(false);
  };

  const handleDocumentProcessed = async (content: string, fileName: string, fileType: string) => {
    await sendMessage(`He subido un documento: ${fileName}`, [{
      type: fileType.startsWith('image/') ? 'image' : 'document',
      fileName,
      fileType,
      content
    }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const toggleVoiceRecorder = () => {
    setShowVoiceRecorder(!showVoiceRecorder);
    if (showDocumentUploader) setShowDocumentUploader(false);
  };

  const toggleDocumentUploader = () => {
    setShowDocumentUploader(!showDocumentUploader);
    if (showVoiceRecorder) setShowVoiceRecorder(false);
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      {/* Header con selector de mes (solo para budget) */}
      {chatType === 'budget' && (
        <div className="p-4 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <MonthSelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={(month, year) => {
                setSelectedMonth(month);
                setSelectedYear(year);
              }}
            />
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">{Math.round((progress / MAX_QUESTIONS) * 100)}%</span>
              <p className="text-xs text-slate-500">Completado</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-4 rounded-full shadow-sm relative"
              initial={{ width: 0 }}
              animate={{ width: `${(progress / MAX_QUESTIONS) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Header con progreso (solo para onboarding) - MEJORADO */}
      {chatType === 'onboarding' && (
        <div className="p-4 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={resetConversation}
                className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                title="Empezar desde el inicio"
              >
                🔄 Reiniciar
              </button>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">{Math.round((progress / MAX_QUESTIONS) * 100)}%</span>
                <p className="text-xs text-slate-500">Completado</p>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-4 rounded-full shadow-sm relative"
              initial={{ width: 0 }}
              animate={{ width: `${(progress / MAX_QUESTIONS) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Avatar */}
                <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-700 text-white shadow-lg' 
                      : 'bg-gradient-to-br from-green-400 to-blue-500 text-white'
                  }`}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Mensaje - CONTRASTE MEJORADO */}
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-slate-900 shadow-xl border-2 border-blue-300 font-semibold'
                      : 'bg-white/80 backdrop-blur-sm text-slate-800 border border-slate-200'
                  }`}>
                    {/* Contenido del mensaje */}
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: message.role === 'assistant' 
                          ? formatFincoMessage(message.content)
                          : message.content
                      }}
                    />

                    {/* Archivos adjuntos */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className={`text-xs px-2 py-1 rounded-lg ${
                            message.role === 'user' ? 'bg-blue-400/50' : 'bg-slate-100'
                          }`}>
                            <span className="font-medium">
                              {attachment.type === 'voice' ? '🎙️ Nota de voz' : 
                               attachment.type === 'image' ? '🖼️ Imagen' : 
                               '📄 Documento'}: 
                            </span>
                            {attachment.fileName && <span className="ml-1">{attachment.fileName}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className={`text-xs mt-2 opacity-70 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Indicador de carga */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-slate-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-red-50 border-t border-red-200"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Área de entrada multimodal */}
      <div className="p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-lg">
        
        {/* Formulario Estructurado Dinámico */}
        <AnimatePresence>
          {showStructuredForm && currentFormType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <div className="mb-3">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  📋 Formulario Estructurado
                </h4>
                <p className="text-sm text-blue-600">
                  Completa la información en el formato solicitado para continuar con precisión.
                </p>
              </div>
              
              <DynamicFormComponentFixed
                questionType={currentFormType}
                onSubmit={handleStructuredSubmit}
                isLoading={loading}
              />
              
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    setShowStructuredForm(false);
                    setCurrentFormType('');
                    setStructuredData(null);
                  }}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Cancelar y usar texto libre
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Herramientas expandibles */}
        <AnimatePresence>
          {showVoiceRecorder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <VoiceRecorderFixed
                onTranscriptionComplete={handleVoiceTranscription}
                onAudioRecorded={() => {}}
                disabled={loading}
              />
            </motion.div>
          )}

          {showDocumentUploader && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <DocumentUploader
                onDocumentProcessed={handleDocumentProcessed}
                disabled={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de entrada principal */}
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Botones de herramientas */}
          <div className="flex space-x-2">
            <motion.button
              type="button"
              onClick={toggleVoiceRecorder}
              className={`p-2 rounded-lg transition-colors ${
                showVoiceRecorder 
                  ? 'bg-blue-500 text-white' 
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              whileTap={{ scale: 0.95 }}
              title="Grabar voz"
            >
              <Mic className="w-5 h-5" />
            </motion.button>

            <motion.button
              type="button"
              onClick={toggleDocumentUploader}
              className={`p-2 rounded-lg transition-colors ${
                showDocumentUploader 
                  ? 'bg-blue-500 text-white' 
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              whileTap={{ scale: 0.95 }}
              title="Subir documento"
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Campo de texto */}
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje, graba tu voz, o sube un documento..."
              disabled={loading || isCompleted}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-medium placeholder:text-slate-500"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          {/* Botón de envío */}
          <motion.button
            type="submit"
            disabled={loading || isCompleted || (!inputMessage.trim() && !showVoiceRecorder && !showDocumentUploader)}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>
      </div>

      {/* Mensaje de completado */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {chatType === 'budget' ? '¡Presupuesto completado!' : '¡Perfil completado!'}
              </h3>
              <p className="text-slate-600 mb-6">
                {chatType === 'budget' 
                  ? 'Tu presupuesto ha sido creado exitosamente. ¡Ahora puedes gestionarlo desde tu dashboard!' 
                  : 'Redirigiendo a tu dashboard...'
                }
              </p>
              {chatType === 'budget' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    if (budgetId) {
                      router.push(`/dashboard/budget/${budgetId}`);
                    } else {
                      router.push('/dashboard');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span>Ver mi presupuesto</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 