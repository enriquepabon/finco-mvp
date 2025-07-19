'use client';

import { TrendingUp, TrendingDown, Shield, Target, AlertTriangle, CheckCircle } from 'lucide-react';

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

interface FinancialIndicatorsProps {
  profile: UserProfile;
  patrimony: number;
  savingsCapacity: number;
  debtRatio: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getHealthStatus = (value: number, thresholds: { good: number; warning: number }, isReverse = false) => {
  if (isReverse) {
    if (value <= thresholds.good) return { status: 'excellent', color: 'green', text: 'Excelente' };
    if (value <= thresholds.warning) return { status: 'good', color: 'blue', text: 'Bueno' };
    return { status: 'warning', color: 'red', text: 'Atención' };
  } else {
    if (value >= thresholds.good) return { status: 'excellent', color: 'green', text: 'Excelente' };
    if (value >= thresholds.warning) return { status: 'good', color: 'blue', text: 'Bueno' };
    return { status: 'warning', color: 'red', text: 'Atención' };
  }
};

export default function FinancialIndicators({ profile, patrimony, savingsCapacity, debtRatio }: FinancialIndicatorsProps) {
  // Calcular indicadores adicionales
  const savingsRate = profile.monthly_income ? (savingsCapacity / profile.monthly_income) * 100 : 0;
  const emergencyFundMonths = profile.monthly_expenses ? (profile.total_savings || 0) / profile.monthly_expenses : 0;
  const assetLiabilityRatio = profile.total_liabilities ? (profile.total_assets || 0) / profile.total_liabilities : 0;

  // Obtener estado de salud de cada indicador
  const patrimonyHealth = getHealthStatus(patrimony, { good: 50000000, warning: 10000000 });
  const savingsHealth = getHealthStatus(savingsRate, { good: 20, warning: 10 });
  const debtHealth = getHealthStatus(debtRatio, { good: 30, warning: 50 }, true);
  const emergencyHealth = getHealthStatus(emergencyFundMonths, { good: 6, warning: 3 });

  const indicators = [
    {
      title: 'Patrimonio Neto',
      value: formatCurrency(patrimony),
      subtitle: `Activos - Pasivos`,
      icon: patrimony >= 0 ? TrendingUp : TrendingDown,
      health: patrimonyHealth,
      description: 'Tu riqueza total después de restar deudas'
    },
    {
      title: 'Capacidad de Ahorro',
      value: formatCurrency(savingsCapacity),
      subtitle: `${savingsRate.toFixed(1)}% de ingresos`,
      icon: savingsCapacity >= 0 ? Target : AlertTriangle,
      health: savingsHealth,
      description: 'Dinero disponible para ahorrar cada mes'
    },
    {
      title: 'Nivel de Endeudamiento',
      value: `${debtRatio.toFixed(1)}%`,
      subtitle: 'De tus ingresos mensuales',
      icon: debtRatio <= 30 ? CheckCircle : AlertTriangle,
      health: debtHealth,
      description: 'Porcentaje de ingresos destinado a pagar deudas'
    },
    {
      title: 'Fondo de Emergencia',
      value: `${emergencyFundMonths.toFixed(1)} meses`,
      subtitle: formatCurrency(profile.total_savings || 0),
      icon: Shield,
      health: emergencyHealth,
      description: 'Meses que podrías cubrir gastos sin ingresos'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {indicators.map((indicator, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${indicator.health.color}-100`}>
              <indicator.icon className={`w-6 h-6 text-${indicator.health.color}-600`} />
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${indicator.health.color}-100 text-${indicator.health.color}-700`}>
              {indicator.health.text}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">{indicator.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{indicator.value}</p>
            <p className="text-sm text-gray-500">{indicator.subtitle}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{indicator.description}</p>
          </div>

          {/* Barra de progreso para algunos indicadores */}
          {(indicator.title === 'Capacidad de Ahorro' || indicator.title === 'Nivel de Endeudamiento') && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-${indicator.health.color}-500 transition-all duration-300`}
                  style={{
                    width: `${Math.min(
                      indicator.title === 'Capacidad de Ahorro' 
                        ? (savingsRate / 30) * 100 
                        : (debtRatio / 100) * 100, 
                      100
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 