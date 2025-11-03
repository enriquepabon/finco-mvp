'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import MultimodalChatInterface from '../../components/chat/MultimodalChatInterface';
import CashbeatLogo from '../../components/ui/CashbeatLogo';

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [onboardingMode, setOnboardingMode] = useState<'form' | 'chat' | null>(null);
  
  // Datos del onboarding
  const [formData, setFormData] = useState({
    fullName: '',
    monthlyIncome: '',
    financialGoals: [] as string[],
    riskTolerance: '',
  });

  const totalSteps = 4;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Verificar si el usuario ya completó el onboarding
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profile && profile.onboarding_completed) {
          // Si ya completó el onboarding, redirigir al dashboard
          console.log('✅ Usuario ya completó onboarding, redirigiendo al dashboard...');
          router.push('/dashboard');
          return;
        }
        
        console.log('🚀 Usuario nuevo o sin onboarding completo, mostrando chat...');
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''
        }));
      }
    };
    getUser();
  }, []);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goal)
        ? prev.financialGoals.filter(g => g !== goal)
        : [...prev.financialGoals, goal]
    }));
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Actualizar el perfil del usuario
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          monthly_income: parseFloat(formData.monthlyIncome) || null,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating profile:', error);
        alert('Error al guardar tus datos. Por favor intenta de nuevo.');
        return;
      }

      console.log('✅ Onboarding completado exitosamente');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error during onboarding completion:', error);
      alert('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Marcar como completado (los datos del chat ya se guardan automáticamente)
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating profile:', error);
        alert('Error al completar onboarding. Por favor intenta de nuevo.');
        return;
      }

      console.log('✅ Onboarding con chat completado exitosamente');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error during chat onboarding completion:', error);
      alert('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim().length > 0;
      case 2:
        return formData.monthlyIncome.trim().length > 0;
      case 3:
        return formData.financialGoals.length > 0;
      case 4:
        return formData.riskTolerance.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Hola! 👋
              </h2>
              <p className="text-gray-600">
                Empecemos conociendo tu nombre completo
              </p>
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Juan Pérez"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tus ingresos 💰
              </h2>
              <p className="text-gray-600">
                ¿Cuál es tu ingreso mensual aproximado?
              </p>
            </div>
            
            <div>
              <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-2">
                Ingreso mensual (USD)
              </label>
              <input
                id="income"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 3000"
                min="0"
                step="100"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tus metas 🎯
              </h2>
              <p className="text-gray-600">
                ¿Qué objetivos financieros quieres lograr? (Puedes elegir varios)
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                'Ahorrar para emergencias',
                'Comprar una casa',
                'Invertir para el retiro',
                'Pagar deudas',
                'Ahorrar para vacaciones',
                'Crear un fondo de inversión',
                'Educación/Estudios',
                'Otro objetivo'
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-4 text-left border rounded-lg transition-colors ${
                    formData.financialGoals.includes(goal)
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded mr-3 ${
                      formData.financialGoals.includes(goal)
                        ? 'bg-blue-500'
                        : 'border-2 border-gray-300'
                    }`} />
                    {goal}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tu perfil de riesgo ⚖️
              </h2>
              <p className="text-gray-600">
                ¿Cómo te sientes con el riesgo en tus inversiones?
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                {
                  value: 'conservative',
                  title: 'Conservador',
                  description: 'Prefiero seguridad, aunque gane menos'
                },
                {
                  value: 'moderate',
                  title: 'Moderado',
                  description: 'Acepto algo de riesgo por mejores retornos'
                },
                {
                  value: 'aggressive',
                  title: 'Agresivo',
                  description: 'Estoy dispuesto a arriesgar por altos retornos'
                }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, riskTolerance: option.value }))}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    formData.riskTolerance === option.value
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      formData.riskTolerance === option.value
                        ? 'bg-blue-500'
                        : 'border-2 border-gray-300'
                    }`} />
                    <div>
                      <div className="font-semibold">{option.title}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Pantalla de selección de modo
  if (!onboardingMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">¡Bienvenido a</span>
                <CashbeatLogo variant="main" size="medium" />
                <span className="text-3xl font-bold text-gray-900">!</span>
              </div>
              <p className="text-gray-600">
                Tu coach financiero personal con inteligencia artificial
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opción Chat con IA */}
              <button
                onClick={() => setOnboardingMode('chat')}
                className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chat con IA
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Conversa with Cashbeat, nuestro asistente inteligente. Él te hará preguntas personalizadas y aprenderá sobre tus metas financieras.
                  </p>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    ✨ Recomendado
                  </div>
                </div>
              </button>

              {/* Opción Formulario */}
              <button
                onClick={() => setOnboardingMode('form')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Formulario Rápido
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Completa un formulario paso a paso con preguntas específicas sobre tus ingresos, gastos y metas.
                  </p>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    🚀 Rápido
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modo Chat
  if (onboardingMode === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
        <div className="max-w-6xl mx-auto h-full">
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={() => setOnboardingMode(null)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              ← Cambiar modo
            </button>
          </div>
          <div className="h-[80vh] rounded-2xl overflow-hidden shadow-2xl">
            <MultimodalChatInterface 
              chatType="onboarding"
              onComplete={handleChatComplete}
              className="h-full"
            />
          </div>
        </div>
      </div>
    );
  }

  // Modo Formulario (existente)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Paso {currentStep} de {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <CashbeatLogo variant="main" size="medium" />
            <h1 className="text-3xl font-bold text-blue-600 mb-2 mt-4">
              ¡Bienvenido a
            </h1>
            <button
              onClick={() => setOnboardingMode(null)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Cambiar modo
            </button>
          </div>

          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed() || loading}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  canProceed() && !loading
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Guardando...' : 'Completar 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 