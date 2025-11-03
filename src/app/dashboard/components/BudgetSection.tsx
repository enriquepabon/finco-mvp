// ============================================================================
// SECCIÓN DE PRESUPUESTO INTELIGENTE - FINCO
// Versión: 1.0.0
// Fecha: Enero 2025
// Descripción: Componente que detecta presupuestos existentes y ofrece navegación directa
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';
import { Calendar, Plus, TrendingUp, BarChart3, ArrowRight, Clock } from 'lucide-react';

interface Budget {
  id: string;
  budget_month: number;
  budget_year: number;
  status: string;
  total_income: number;
  total_fixed_expenses: number;
  total_variable_expenses: number;
  chat_completed: boolean;
  created_at: string;
}

interface BudgetSectionProps {
  userId: string;
}

export default function BudgetSection({ userId }: BudgetSectionProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Nombres de meses
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    loadUserBudgets();
  }, [userId]);

  const loadUserBudgets = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const { data: budgetsData, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('budget_year', { ascending: false })
        .order('budget_month', { ascending: false })
        .limit(5);

      if (!error && budgetsData) {
        setBudgets(budgetsData);
      }
    } catch (error) {
      console.error('Error cargando presupuestos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestBudget = () => {
    return budgets.find(budget => budget.status === 'active') || budgets[0];
  };

  const calculateBalance = (budget: Budget) => {
    return budget.total_income - budget.total_fixed_expenses - budget.total_variable_expenses;
  };

  const goToBudget = (budgetId: string) => {
    router.push(`/dashboard/budget/${budgetId}`);
  };

  const createNewBudget = () => {
    router.push('/budget/create');
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando presupuestos...</p>
      </div>
    );
  }

  // Si no tiene presupuestos, mostrar la vista de creación
  if (budgets.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">💰</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear Presupuesto Inteligente</h2>
        <p className="text-gray-600 mb-6">
          FINCO te ayudará a crear un presupuesto personalizado mediante una conversación inteligente.
        </p>
        <button
          onClick={() => router.push('/budget/create')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          💰 Crear Nuevo Presupuesto
        </button>
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800">Categorías Flexibles</h3>
              <p className="text-gray-600">Crea tus propias categorías de ingresos y gastos</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-semibold text-gray-800">Por Períodos</h3>
              <p className="text-gray-600">Presupuestos mensuales con calendario integrado</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-800">Seguimiento Real</h3>
              <p className="text-gray-600">Compara presupuestado vs real con alertas</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene presupuestos, mostrar la vista de gestión
  const latestBudget = getLatestBudget();
  const balance = latestBudget ? calculateBalance(latestBudget) : 0;

  return (
    <div className="space-y-8">
      {/* Presupuesto principal */}
      {latestBudget && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Presupuesto Actual
              </h2>
              <p className="text-gray-600">
                {monthNames[latestBudget.budget_month - 1]} {latestBudget.budget_year}
                {latestBudget.chat_completed && (
                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    ✅ Completado
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => goToBudget(latestBudget.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Ver Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Ingresos</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                ${latestBudget.total_income.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm font-medium text-gray-600">G. Fijos</span>
              </div>
              <p className="text-lg font-bold text-red-600">
                ${latestBudget.total_fixed_expenses.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm font-medium text-gray-600">G. Variables</span>
              </div>
              <p className="text-lg font-bold text-yellow-600">
                ${latestBudget.total_variable_expenses.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium text-gray-600">Balance</span>
              </div>
              <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de presupuestos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Mis Presupuestos ({budgets.length})
            </h3>
            <button
              onClick={createNewBudget}
              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Nuevo
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {budgets.map((budget) => {
            const budgetBalance = calculateBalance(budget);
            return (
              <div
                key={budget.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => goToBudget(budget.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      budget.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {monthNames[budget.budget_month - 1]} {budget.budget_year}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{budget.status === 'active' ? 'Activo' : budget.status}</span>
                        {budget.chat_completed ? (
                          <span className="text-green-600">• Completado via FINCO</span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            En progreso
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">Balance</p>
                    <p className={`text-lg font-bold ${budgetBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${budgetBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 