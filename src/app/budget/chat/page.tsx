'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';
import MultimodalChatInterface from '../../../components/chat/MultimodalChatInterface';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';

export default function BudgetChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [budgetPeriod, setBudgetPeriod] = useState<{month: number, year: number} | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('❌ Usuario no autenticado, redirigiendo al login...');
          router.push('/auth/login');
          return;
        }

        setUser(user);
        console.log('✅ Usuario autenticado para chat de presupuesto:', user.email);

        // Verificar si el usuario completó el onboarding
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!profile || !profile.onboarding_completed) {
          console.log('❌ Usuario sin onboarding completo, redirigiendo...');
          router.push('/onboarding');
          return;
        }

        // Configurar período por defecto (mes actual)
        const now = new Date();
        setBudgetPeriod({
          month: now.getMonth() + 1,
          year: now.getFullYear()
        });

        console.log('🏦 Iniciando chat de presupuesto para:', profile.full_name);
        
      } catch (error) {
        console.error('❌ Error verificando usuario:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  const handleBudgetComplete = async () => {
    console.log('🎉 Presupuesto completado');
    
    try {
      // Redirigir al dashboard para ver el presupuesto creado
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error durante finalización del presupuesto:', error);
      alert('Error inesperado. Por favor intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 animate-pulse">Preparando tu chat de presupuesto...</p>
        </div>
      </div>
    );
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/budget/create')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver a opciones de creación"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Crear Presupuesto con IA
                  </h1>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Chat Multimodal</p>
              <p className="text-xs text-gray-400">Voz, Texto y Documentos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <MultimodalChatInterface
            chatType="budget"
            onComplete={handleBudgetComplete}
          />
        </div>
      </div>

      {/* Info Footer */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-blue-100 rounded-full">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                ¿Cómo funciona el chat de presupuesto?
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                FINCO te guiará paso a paso para crear tu presupuesto mensual. Puedes responder con voz, 
                texto o subir documentos. Te preguntará sobre tus ingresos, gastos fijos y variables, 
                y te ayudará a organizarlos por categorías. Al final tendrás un presupuesto completo y personalizado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 