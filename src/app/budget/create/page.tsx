'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';
import {
  Bot,
  FileText,
  Copy,
  ArrowRight,
  Calendar,
  MessageSquare,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';

interface UserBudget {
  id: string;
  budget_month: number;
  budget_year: number;
  status: string;
  total_income: number;
  total_fixed_expenses: number;
  total_variable_expenses: number;
  created_at: string;
}

export default function CreateBudgetPage() {
  const router = useRouter();
  // supabase ya está importado arriba
  const [loading, setLoading] = useState(true);
  const [recentBudgets, setRecentBudgets] = useState<UserBudget[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  useEffect(() => {
    loadRecentBudgets();
  }, []);

  const loadRecentBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setRecentBudgets(data);
      }
    } catch (error) {
      console.error('Error cargando presupuestos recientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelection = (method: string, budgetId?: string) => {
    setSelectedMethod(method);
    
    setTimeout(() => {
      switch (method) {
        case 'cashbeat-chat':
          router.push('/budget/chat');
          break;
        case 'manual-template':
          router.push('/budget/create/manual');
          break;
        case 'duplicate':
          if (budgetId) {
            router.push(`/budget/create/duplicate/${budgetId}`);
          }
          break;
      }
    }, 500);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Nuevo Presupuesto
          </h1>
          <p className="text-gray-600 text-lg">
            Elige cómo quieres crear tu presupuesto mensual
          </p>
        </div>

        {/* Opciones de Creación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Opción 1: FINCO Chat */}
          <div 
            className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-105 ${
              selectedMethod === 'cashbeat-chat' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleMethodSelection('cashbeat-chat')}
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Con Cashbeat IA
              </h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                Conversación guiada con nuestro asistente inteligente
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs text-gray-500">
                  <MessageSquare className="w-3 h-3 mr-2" />
                  Chat conversacional
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Zap className="w-3 h-3 mr-2" />
                  Recomendaciones IA
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-2" />
                  5-10 minutos
                </div>
              </div>

              <div className="text-center">
                <span className="inline-flex items-center text-blue-600 font-medium text-sm">
                  Comenzar Chat
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </div>

            {selectedMethod === 'cashbeat-chat' && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            )}
          </div>

          {/* Opción 2: Template Manual */}
          <div 
            className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-105 ${
              selectedMethod === 'manual-template' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
            }`}
            onClick={() => handleMethodSelection('manual-template')}
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Template Manual
              </h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                Formulario directo para crear tu presupuesto paso a paso
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs text-gray-500">
                  <FileText className="w-3 h-3 mr-2" />
                  Formulario estructurado
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Zap className="w-3 h-3 mr-2" />
                  Control total
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-2" />
                  3-5 minutos
                </div>
              </div>

              <div className="text-center">
                <span className="inline-flex items-center text-green-600 font-medium text-sm">
                  Crear Manual
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
              
              {recentBudgets.length > 0 && (
                <div className="mt-4 pt-3 border-t border-green-300">
                  <button
                    onClick={() => setSelectedMethod('duplicate')}
                    className="w-full flex items-center justify-center gap-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-100 py-2 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    O duplicar presupuesto existente
                  </button>
                </div>
              )}
            </div>

            {selectedMethod === 'manual-template' && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>

          {/* Opción 3: Duplicar Mes Anterior */}
          <div 
            className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-300 ${
              recentBudgets.length > 0 
                ? `cursor-pointer hover:shadow-md hover:scale-105 ${
                    selectedMethod === 'duplicate' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }` 
                : 'opacity-50 cursor-not-allowed border-gray-200'
            }`}
            onClick={() => recentBudgets.length > 0 && setSelectedMethod('duplicate')}
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg mx-auto mb-4">
                <Copy className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Duplicar Anterior
              </h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                {recentBudgets.length > 0 
                  ? 'Copia un presupuesto existente y modifícalo' 
                  : 'No hay presupuestos previos disponibles'
                }
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs text-gray-500">
                  <Copy className="w-3 h-3 mr-2" />
                  Copia existente
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Zap className="w-3 h-3 mr-2" />
                  Súper rápido
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-2" />
                  1-2 minutos
                </div>
              </div>

              <div className="text-center">
                {recentBudgets.length > 0 ? (
                  <span className="inline-flex items-center text-purple-600 font-medium text-sm">
                    Ver Opciones
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">No disponible</span>
                )}
              </div>
            </div>

            {selectedMethod === 'duplicate' && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
            )}
          </div>
        </div>

        {/* Presupuestos Recientes para Duplicar */}
        {selectedMethod === 'duplicate' && recentBudgets.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Selecciona un presupuesto para duplicar
            </h3>
            <div className="space-y-3">
              {recentBudgets.map((budget) => (
                <div 
                  key={budget.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors"
                  onClick={() => handleMethodSelection('duplicate', budget.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {monthNames[budget.budget_month - 1]} {budget.budget_year}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Ingresos: ${budget.total_income.toLocaleString()} • 
                        Gastos: ${(budget.total_fixed_expenses + budget.total_variable_expenses).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      budget.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {budget.status === 'active' ? 'Activo' : budget.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de Regreso */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 