'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  age?: number;
  civil_status?: string;
  children_count?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_savings?: number;
  onboarding_completed: boolean;
}

interface CashFlowChartProps {
  profile: UserProfile;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCurrencyShort = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
};

export default function CashFlowChart({ profile }: CashFlowChartProps) {
  const income = profile.monthly_income || 0;
  const expenses = profile.monthly_expenses || 0;
  const cashFlow = income - expenses;

  // Datos para el gráfico
  const data = [
    {
      name: 'Ingresos',
      value: income,
      fill: '#10B981' // green-500
    },
    {
      name: 'Gastos',
      value: expenses,
      fill: '#EF4444' // red-500
    },
    {
      name: 'Flujo Neto',
      value: Math.abs(cashFlow),
      fill: cashFlow >= 0 ? '#3B82F6' : '#F59E0B' // blue-500 or amber-500
    }
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
          {label === 'Flujo Neto' && (
            <p className="text-xs text-gray-500">
              {cashFlow >= 0 ? 'Excedente mensual' : 'Déficit mensual'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Flujo de Caja</h3>
            <p className="text-sm text-gray-500">Ingresos vs gastos mensuales</p>
          </div>
        </div>
      </div>

      {income > 0 || expenses > 0 ? (
        <div className="space-y-6">
          {/* Gráfico */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tickFormatter={formatCurrencyShort}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Resumen del flujo de caja */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Ingresos</p>
                  <p className="text-lg font-bold text-green-900">{formatCurrency(income)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">Gastos</p>
                  <p className="text-lg font-bold text-red-900">{formatCurrency(expenses)}</p>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                cashFlow >= 0 ? 'bg-blue-50' : 'bg-amber-50'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  cashFlow >= 0 ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  {cashFlow >= 0 ? (
                    <TrendingUp className={`w-4 h-4 text-blue-600`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 text-amber-600`} />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    cashFlow >= 0 ? 'text-blue-800' : 'text-amber-800'
                  }`}>
                    Flujo Neto
                  </p>
                  <p className={`text-lg font-bold ${
                    cashFlow >= 0 ? 'text-blue-900' : 'text-amber-900'
                  }`}>
                    {formatCurrency(cashFlow)}
                  </p>
                </div>
              </div>
            </div>

            {/* Análisis del flujo */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Análisis:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cashFlow >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {cashFlow >= 0 ? 'Flujo Positivo' : 'Flujo Negativo'}
                </span>
              </div>
              
              {cashFlow >= 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    ✅ Tienes un excedente de <strong>{formatCurrency(cashFlow)}</strong> mensual
                  </p>
                  <p className="text-xs text-gray-500">
                    Representa el {((cashFlow / income) * 100).toFixed(1)}% de tus ingresos disponible para ahorrar o invertir.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    ⚠️ Tienes un déficit de <strong>{formatCurrency(Math.abs(cashFlow))}</strong> mensual
                  </p>
                  <p className="text-xs text-gray-500">
                    Tus gastos exceden tus ingresos en {(((Math.abs(cashFlow)) / income) * 100).toFixed(1)}%.
                  </p>
                </div>
              )}

              {/* Barra de progreso de eficiencia */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Eficiencia de gastos</span>
                  <span>{income > 0 ? ((expenses / income) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (expenses / income) <= 0.8 ? 'bg-green-500' : 
                      (expenses / income) <= 0.9 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((expenses / income) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {(expenses / income) <= 0.8 ? 'Excelente control de gastos' : 
                   (expenses / income) <= 0.9 ? 'Buen control de gastos' : 'Revisa tus gastos'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos de flujo</h3>
          <p className="text-gray-500">
            Agrega información sobre tus ingresos y gastos para ver tu flujo de caja.
          </p>
        </div>
      )}
    </div>
  );
} 