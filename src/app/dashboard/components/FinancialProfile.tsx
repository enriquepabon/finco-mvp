'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DollarSign, Edit3, Save, X, TrendingUp, TrendingDown, Home, CreditCard, Wallet } from 'lucide-react';

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

interface FinancialProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  compact?: boolean;
}

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function FinancialProfile({ profile, onUpdate, compact = false }: FinancialProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    monthly_income: profile.monthly_income || 0,
    monthly_expenses: profile.monthly_expenses || 0,
    total_assets: profile.total_assets || 0,
    total_liabilities: profile.total_liabilities || 0,
    total_savings: profile.total_savings || 0
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(editData)
        .eq('user_id', profile.user_id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setIsEditing(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error actualizando perfil financiero:', errorMessage);
      alert('Error al actualizar el perfil financiero. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      monthly_income: profile.monthly_income || 0,
      monthly_expenses: profile.monthly_expenses || 0,
      total_assets: profile.total_assets || 0,
      total_liabilities: profile.total_liabilities || 0,
      total_savings: profile.total_savings || 0
    });
    setIsEditing(false);
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    setEditData({ ...editData, [field]: numValue });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${compact ? 'p-6' : 'p-8'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Perfil Financiero</h3>
            {compact && <p className="text-sm text-gray-500">Situación económica</p>}
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
            title="Editar perfil financiero"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              <span>{saving ? 'Guardando...' : 'Guardar'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Cancelar</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Ingresos Mensuales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-1 text-green-500" />
            Ingresos Mensuales
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="text"
                value={editData.monthly_income.toLocaleString()}
                onChange={(e) => handleNumberChange('monthly_income', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          ) : (
            <p className="text-gray-900 font-medium text-lg">
              {formatCurrency(profile.monthly_income)}
            </p>
          )}
        </div>

        {/* Gastos Mensuales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TrendingDown className="w-4 h-4 inline mr-1 text-red-500" />
            Gastos Mensuales
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="text"
                value={editData.monthly_expenses.toLocaleString()}
                onChange={(e) => handleNumberChange('monthly_expenses', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          ) : (
            <p className="text-gray-900 font-medium text-lg">
              {formatCurrency(profile.monthly_expenses)}
            </p>
          )}
        </div>

        {/* Activos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Home className="w-4 h-4 inline mr-1 text-blue-500" />
            Activos Totales
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="text"
                value={editData.total_assets.toLocaleString()}
                onChange={(e) => handleNumberChange('total_assets', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          ) : (
            <p className="text-gray-900 font-medium text-lg">
              {formatCurrency(profile.total_assets)}
            </p>
          )}
          {!isEditing && (
            <p className="text-xs text-gray-500 mt-1">Casa, carro, inversiones, etc.</p>
          )}
        </div>

        {/* Pasivos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-1 text-orange-500" />
            Pasivos Totales
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="text"
                value={editData.total_liabilities.toLocaleString()}
                onChange={(e) => handleNumberChange('total_liabilities', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          ) : (
            <p className="text-gray-900 font-medium text-lg">
              {formatCurrency(profile.total_liabilities)}
            </p>
          )}
          {!isEditing && (
            <p className="text-xs text-gray-500 mt-1">Tarjetas, préstamos, hipoteca, etc.</p>
          )}
        </div>

        {/* Ahorros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Wallet className="w-4 h-4 inline mr-1 text-purple-500" />
            Ahorros Actuales
          </label>
          {isEditing ? (
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="text"
                value={editData.total_savings.toLocaleString()}
                onChange={(e) => handleNumberChange('total_savings', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          ) : (
            <p className="text-gray-900 font-medium text-lg">
              {formatCurrency(profile.total_savings)}
            </p>
          )}
          {!isEditing && (
            <p className="text-xs text-gray-500 mt-1">Cuentas de ahorro, inversiones líquidas</p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Flujo mensual:</span>
              <span className={`font-medium ${
                (profile.monthly_income || 0) - (profile.monthly_expenses || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency((profile.monthly_income || 0) - (profile.monthly_expenses || 0))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Patrimonio neto:</span>
              <span className={`font-medium ${
                (profile.total_assets || 0) - (profile.total_liabilities || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency((profile.total_assets || 0) - (profile.total_liabilities || 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 