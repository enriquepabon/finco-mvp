'use client';

// ============================================================================
// INTERFAZ DE CHAT PARA PRESUPUESTO CONVERSACIONAL - CASHBEAT
// Versión: 2.0.0 (Refactorizado)
// Fecha: Noviembre 2025
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
import { useChat } from '../../hooks/useChat';
import { useChatSubmit } from '../../hooks/useChatSubmit';
import { ChatMessage } from '../../types/chat';

// Interfaces
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

const WELCOME_MESSAGE = "¡Hola! Soy Cashbeat IA, tu coach financiero personal 🤖💰\n\nVamos a crear juntos un presupuesto que transforme tu relación con el dinero. Te haré 10 preguntas sencillas para entender tu situación financiera.\n\n¿Estás listo para tomar el control total de tus finanzas? 💪";

export default function BudgetChatInterface({
  initialMessage = "¡Hola! Estoy listo para crear mi presupuesto 💪",
  onComplete
}: BudgetChatInterfaceProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Budget-specific state
  const [questionNumber, setQuestionNumber] = useState(1);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [categoriesCreated, setCategoriesCreated] = useState<BudgetCategory[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Use shared chat hook with custom request body
  const {
    messages,
    inputMessage,
    setInputMessage,
    loading,
    messagesEndRef,
    sendMessage: sendChatMessage
  } = useChat({
    apiEndpoint: '/api/budget-chat',
    welcomeMessage: WELCOME_MESSAGE,
    includeUserToken: false,
    customRequestBody: (message) => ({
      message,
      budgetId,
      questionNumber,
      period: selectedPeriod
    })
  });

  // Use shared submit handler
  const { handleKeyPress } = useChatSubmit({
    onSubmit: handleSendMessage,
    disabled: loading
  });

  // Custom send message handler to process budget-specific response
  async function handleSendMessage() {
    if (!inputMessage.trim() || loading) return;

    try {
      // Send via useChat hook
      await sendChatMessage();

      // Note: We need to intercept the response to extract budget-specific data
      // For now, this is a simplified version. In production, we'd need to modify
      // useChat to support response interceptors or move this logic to the API.

    } catch (error) {
      console.error('Error sending budget message:', error);
    }
  }

  // Simplified send that calls the API directly to get budget-specific data
  const sendBudgetMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    try {
      const response = await fetch('/api/budget-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          budgetId,
          questionNumber,
          period: selectedPeriod
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();

      // Update question number
      setQuestionNumber(data.questionNumber || questionNumber + 1);

      // Update budget ID
      if (data.budgetId && !budgetId) {
        setBudgetId(data.budgetId);
      }

      // Update categories
      if (data.categoriesCreated && data.categoriesCreated.length > 0) {
        setCategoriesCreated(prev => [...prev, ...data.categoriesCreated]);
      }

      // Check completion
      if (data.isComplete) {
        setIsComplete(true);
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
      console.error('Error sending budget message:', error);
    }
  };

  // Period navigation
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

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header con progreso */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Creador de Presupuesto</h1>
              <p className="text-sm text-slate-600">Con Cashbeat IA, tu coach financiero personal</p>
            </div>
          </div>

          {/* Progress bar */}
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

          {/* Period selector */}
          {questionNumber >= 2 && !isComplete && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Período:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changePeriod('prev')}
                  className="p-1 hover:bg-blue-100 rounded"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-blue-600" />
                </button>
                <span className="font-semibold text-blue-800 min-w-32 text-center">
                  {monthNames[selectedPeriod.month - 1]} {selectedPeriod.year}
                </span>
                <button
                  onClick={() => changePeriod('next')}
                  className="p-1 hover:bg-blue-100 rounded"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main container */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-white shadow-sm border border-slate-200 text-slate-800'
                  }`}
                >
                  {message.role === 'assistant' && (
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
                      message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
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

            {/* Loading indicator */}
            {loading && (
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
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={loading ? "Cashbeat IA está pensando..." : "Escribe tu respuesta..."}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendBudgetMessage}
                  disabled={!inputMessage.trim() || loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Completion message */}
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

        {/* Sidebar - Categories preview */}
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

            {/* Summary */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-slate-800 text-sm">Resumen</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Categorías:</span>
                  <span className="font-medium text-slate-800">{categoriesCreated.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Período:</span>
                  <span className="font-medium text-slate-800">
                    {monthNames[selectedPeriod.month - 1]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
