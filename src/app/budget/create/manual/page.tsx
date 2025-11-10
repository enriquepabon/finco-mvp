'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function DeprecatedManualBudgetPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente después de 2 segundos
    const timer = setTimeout(() => {
      router.push('/budget/create');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Nueva Experiencia Disponible!
          </h1>
          
          <p className="text-gray-600 mb-6">
            La creación manual de presupuestos ha sido reemplazada por una experiencia interactiva guiada por MentorIA.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Redirigiendo a la nueva experiencia...
            </p>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-[loading_2s_ease-in-out]" style={{
                animation: 'loading 2s ease-in-out forwards',
                width: '0%'
              }}></div>
            </div>
          </div>

          <button
            onClick={() => router.push('/budget/create')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Ir ahora
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
