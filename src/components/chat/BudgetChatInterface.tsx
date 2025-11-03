'use client';

// ============================================================================
// INTERFAZ DE CHAT PARA PRESUPUESTO CONVERSACIONAL - CASHBEAT
// Versión: 1.0.0
// Fecha: Enero 2025
// Descripción: Chat especializado con calendario, progreso y vista previa
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Calendar, 
  TrendingUp, 
  PiggyBank, 
  Target,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Interfaces
interface Message {
  id: string;
  type: 'user' | 'cashbeat';
  content: string;
  timestamp: Date;
  questionNumber?: number;
}

interface BudgetCategory {
  name: string;
  type: 'income' | 'fixed_expense' | 'variable_expense';
  amount: number;
  icon?: string;
}

interface BudgetChatInterfaceProps {
  initialMessage?: string;
  onComplete?: (budgetId: string) => void;
}

export default function BudgetChatInterface({ 
  initialMessage = "¡Hola! Estoy listo para crear mi presupuesto 💪",
  onComplete 
}: BudgetChatInterfaceProps) {
  // Estados
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [categoriesCreated, setCategoriesCreated] = useState<BudgetCategory[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Scroll automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mensaje inicial de Cashbeat IA
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'cashbeat',
      content: "¡Hola! Soy Cashbeat IA, tu coach financiero personal 🤖💰\n\nVamos a crear juntos un presupuesto que transforme tu relación con el dinero. Te haré 10 preguntas sencillas para entender tu situación financiera.\n\n¿Estás listo para tomar el control total de tus finanzas? 💪",
      timestamp: new Date(),
      questionNumber: 1
    };
    setMessages([welcomeMessage]);
  }, []);
  
  // Enviar mensaje
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
      questionNumber
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/budget-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          budgetId,
          questionNumber,
          period: selectedPeriod
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Mensaje de respuesta de Cashbeat IA
      const fincoMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'cashbeat',
        content: data.fincoResponse,
        timestamp: new Date(),
        questionNumber: data.questionNumber
      };
      
      setMessages(prev => [...prev, fincoMessage]);
      setQuestionNumber(data.questionNumber);
      
      // Actualizar estado
      if (data.budgetId && !budgetId) {
        setBudgetId(data.budgetId);
      }
      
      if (data.categoriesCreated && data.categoriesCreated.length > 0) {
        setCategoriesCreated(prev => [...prev, ...data.categoriesCreated]);
      }
      
      if (data.isComplete) {
        setIsComplete(true);
        // Redirigir al dashboard de presupuesto después de 3 segundos
        setTimeout(() => {
          if (onComplete && data.budgetId) {
            onComplete(data.budgetId);
          } else if (data.budgetId) {
            router.push(`/dashboard/budget/${data.budgetId}`);
          } else {
            router.push('/dashboard');
          }
        }, 3000);
      }
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      const errorContent = error instanceof Error ? error.message : 'Error desconocido';
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'cashbeat',
        content: `Lo siento, hubo un error: ${errorContent}\n\n¿Podrías intentar de nuevo? 😅`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Cambiar período
  const changePeriod = (direction: 'prev' | 'next') => {
    setSelectedPeriod(prev => {
      if (direction === 'next') {
        if (prev.month === 12) {
          return { month: 1, year: prev.year + 1 };
        }
        return { ...prev, month: prev.month + 1 };
      } else {
        if (prev.month === 1) {
          return { month: 12, year: prev.year - 1 };
        }
        return { ...prev, month: prev.month - 1 };
      }
    });
  };
  
  // Nombres de meses
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header con progreso */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Título */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Creador de Presupuesto</h1>
              <p className="text-sm text-slate-600">Con Cashbeat IA, tu coach financiero personal</p>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">
                Pregunta {Math.min(questionNumber, 10)} de 10
              </span>
              <span className="text-sm text-slate-500">
                {Math.round((Math.min(questionNumber, 10) / 10) * 100)}% completo
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(Math.min(questionNumber, 10) / 10) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Selector de período */}
          {questionNumber >= 2 && !isComplete && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Período:</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => changePeriod('prev')}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  <ChevronLeft className="w-4 h-4 text-blue-600" />
                </button>
                <span className="font-semibold text-blue-800 min-w-32 text-center">
                  {monthNames[selectedPeriod.month - 1]} {selectedPeriod.year}
                </span>
                <button 
                  onClick={() => changePeriod('next')}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Contenedor principal */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-white shadow-sm border border-slate-200 text-slate-800'
                  }`}
                >
                  {message.type === 'cashbeat' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">F</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">Cashbeat IA</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <div className="flex justify-end mt-2">
                    <span className={`text-xs ${
                      message.type === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicador de carga */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white shadow-sm border border-slate-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">F</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Cashbeat IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 animate-spin" />
                    <span className="text-sm text-slate-600">Analizando tu respuesta...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          {!isComplete && (
            <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? "Cashbeat IA está pensando..." : "Escribe tu respuesta..."}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Mensaje de finalización */}
          {isComplete && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-t border-green-200">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold">¡Presupuesto completado! 🎉</p>
                  <p className="text-sm text-green-700">
                    Redirigiendo al dashboard de presupuesto...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Panel lateral - Vista previa de categorías */}
        {categoriesCreated.length > 0 && (
          <div className="w-80 bg-white/50 backdrop-blur-sm border-l border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Categorías Creadas
            </h3>
            
            <div className="space-y-3">
              {categoriesCreated.map((category, index) => (
                <div key={index} className="p-3 bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${
                      category.type === 'income' ? 'bg-green-500' :
                      category.type === 'fixed_expense' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="font-medium text-sm text-slate-800">{category.name}</span>
                  </div>
                  {category.amount > 0 && (
                    <p className="text-sm text-slate-600">
                      ${category.amount.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 capitalize">
                    {category.type.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Resumen</span>
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <p>Ingresos: {categoriesCreated.filter(c => c.type === 'income').length}</p>
                <p>Gastos fijos: {categoriesCreated.filter(c => c.type === 'fixed_expense').length}</p>
                <p>Gastos variables: {categoriesCreated.filter(c => c.type === 'variable_expense').length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 