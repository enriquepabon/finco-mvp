'use client';

/**
 * Botón flotante para registrar transacciones
 * Con dropdown de opciones: Manual y Voz
 * MentorIA - Sistema de Registro de Transacciones
 */

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Mic } from 'lucide-react';
import TransactionModal from './TransactionModal';
import VoiceTransactionModal from './VoiceTransactionModal';
import { supabase } from '@/lib/supabase/client';

interface TransactionButtonProps {
  budgetId?: string;
  className?: string;
  variant?: 'floating' | 'inline';
}

export default function TransactionButton({ 
  budgetId: propBudgetId,
  className = '',
  variant = 'inline'
}: TransactionButtonProps) {
  const [showManualModal, setShowManualModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState(propBudgetId);

  useEffect(() => {
    if (!propBudgetId) {
      loadCurrentBudget();
    }
  }, [propBudgetId]);

  const loadCurrentBudget = async () => {
    try {
      console.log('🔍 Loading current budget...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user found');
        return;
      }

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      console.log(`📅 Looking for budget: ${currentMonth}/${currentYear}`);

      const { data, error } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('budget_month', currentMonth)
        .eq('budget_year', currentYear)
        .maybeSingle(); // Usa maybeSingle() en lugar de single() para evitar error si no existe

      // Solo mostrar error si es un error real (no "no encontrado")
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading budget:', error);
      }

      if (data) {
        console.log('✅ Budget found:', data.id);
        setCurrentBudgetId(data.id);
      } else {
        console.log('ℹ️  No budget found for current month - user can create one');
      }
    } catch (error) {
      console.error('❌ Error loading current budget:', error);
    }
  };

  const handleSuccess = () => {
    // Recargar la página o actualizar estado según sea necesario
    window.location.reload();
  };

  if (variant === 'floating') {
    return (
      <>
        {/* Botón flotante */}
        <div className={`fixed bottom-8 right-8 z-40 ${className}`}>
          <div className="relative">
            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slideUp">
                <button
                  onClick={() => {
                    setShowManualModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Edit className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Registro Manual</p>
                    <p className="text-xs text-gray-500">Ingresa los datos manualmente</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowVoiceModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Registro por Voz</p>
                    <p className="text-xs text-gray-500">Usa IA para registrar con voz</p>
                  </div>
                </button>
              </div>
            )}

            {/* Botón principal */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all flex items-center justify-center"
            >
              <PlusCircle className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Modales */}
        {currentBudgetId && (
          <>
            <TransactionModal
              isOpen={showManualModal}
              onClose={() => setShowManualModal(false)}
              onSuccess={handleSuccess}
              budgetId={currentBudgetId}
            />
            <VoiceTransactionModal
              isOpen={showVoiceModal}
              onClose={() => setShowVoiceModal(false)}
              onSuccess={handleSuccess}
              budgetId={currentBudgetId}
            />
          </>
        )}

        <style jsx global>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideUp {
            animation: slideUp 0.2s ease-out;
          }
        `}</style>
      </>
    );
  }

  // Variant: inline
  return (
    <>
      <div className={`flex gap-3 ${className}`}>
        <button
          onClick={() => {
            console.log('🖱️  Manual button clicked');
            console.log('Current budget ID:', currentBudgetId);
            setShowManualModal(true);
          }}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Edit className="w-5 h-5" />
          Registro Manual
        </button>

        <button
          onClick={() => {
            console.log('🖱️  Voice button clicked');
            console.log('Current budget ID:', currentBudgetId);
            setShowVoiceModal(true);
          }}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Mic className="w-5 h-5" />
          Registro por Voz
        </button>
      </div>

      {/* Modales */}
      {currentBudgetId ? (
        <>
          <TransactionModal
            isOpen={showManualModal}
            onClose={() => setShowManualModal(false)}
            onSuccess={handleSuccess}
            budgetId={currentBudgetId}
          />
          <VoiceTransactionModal
            isOpen={showVoiceModal}
            onClose={() => setShowVoiceModal(false)}
            onSuccess={handleSuccess}
            budgetId={currentBudgetId}
          />
        </>
      ) : (
        showManualModal || showVoiceModal ? (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay presupuesto activo</h3>
              <p className="text-gray-600 mb-6">
                Necesitas crear un presupuesto para el mes actual antes de registrar transacciones.
              </p>
              <button
                onClick={() => {
                  setShowManualModal(false);
                  setShowVoiceModal(false);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        ) : null
      )}
    </>
  );
}

