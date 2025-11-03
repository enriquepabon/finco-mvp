'use client';

import MultimodalChatInterface from '@/components/chat/MultimodalChatInterface';

export default function TestOnboardingImprovements() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              🧪 Prueba de Mejoras del Onboarding
            </h1>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">
                Verificar estas mejoras:
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-600">✅ Mensaje Inicial:</h3>
                  <p className="text-sm text-slate-600">
                    Debe mencionar "análisis financiero completo" y listar los beneficios
                  </p>
                  
                  <h3 className="font-semibold text-green-600">✅ Contraste Mejorado:</h3>
                  <p className="text-sm text-slate-600">
                    Tus mensajes deben tener fondo azul más oscuro (bg-blue-600)
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-purple-600">✅ Progreso Visual:</h3>
                  <p className="text-sm text-slate-600">
                    Header con "📊 Análisis Financiero" y porcentaje grande
                  </p>
                  
                  <h3 className="font-semibold text-red-600">✅ Redirección:</h3>
                  <p className="text-sm text-slate-600">
                    Al completar 9 preguntas debe redirigir al dashboard automáticamente
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-[600px]">
            <MultimodalChatInterface 
              chatType="onboarding" 
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 