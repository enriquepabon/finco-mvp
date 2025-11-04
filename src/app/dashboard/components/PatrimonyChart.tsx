'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Home, CreditCard, PieChart as PieChartIcon } from 'lucide-react';

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

interface PatrimonyChartProps {
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

const COLORS = {
  assets: '#10B981', // green-500
  liabilities: '#EF4444', // red-500
  netWorth: '#3B82F6' // blue-500
};

export default function PatrimonyChart({ profile }: PatrimonyChartProps) {
  const assets = profile.total_assets || 0;
  const liabilities = profile.total_liabilities || 0;
  const netWorth = assets - liabilities;

  // Datos para el gráfico de dona
  const data = [
    {
      name: 'Activos',
      value: assets,
      color: COLORS.assets,
      icon: '🏠'
    },
    {
      name: 'Pasivos',
      value: liabilities,
      color: COLORS.liabilities,
      icon: '💳'
    }
  ].filter(item => item.value > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
          <p className="text-xs text-gray-500">
            {((data.value / (assets + liabilities)) * 100).toFixed(1)}% del total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label
  const renderLabel = (entry: { value?: number }) => {
    if (entry.value === undefined) return '';
    const percent = ((entry.value / (assets + liabilities)) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Patrimonio</h3>
            <p className="text-sm text-gray-500">Distribución de activos y pasivos</p>
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="space-y-6">
          {/* Gráfico */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Resumen de patrimonio */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Activos</p>
                  <p className="text-lg font-bold text-green-900">{formatCurrency(assets)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">Pasivos</p>
                  <p className="text-lg font-bold text-red-900">{formatCurrency(liabilities)}</p>
                </div>
              </div>
            </div>

            {/* Patrimonio neto */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Patrimonio Neto:</span>
                <span className={`text-xl font-bold ${
                  netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(netWorth)}
                </span>
              </div>
              
              {/* Barra de progreso del patrimonio */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Nivel de patrimonio</span>
                  <span>{netWorth >= 0 ? 'Positivo' : 'Negativo'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      netWorth >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: netWorth >= 0 
                        ? `${Math.min((netWorth / Math.max(assets, 50000000)) * 100, 100)}%`
                        : `${Math.min((Math.abs(netWorth) / Math.max(liabilities, 50000000)) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos financieros</h3>
          <p className="text-gray-500">
            Agrega información sobre tus activos y pasivos para ver tu patrimonio.
          </p>
        </div>
      )}
    </div>
  );
} 