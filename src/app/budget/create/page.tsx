'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import InteractiveBudgetChat from '@/components/budget/InteractiveBudgetChat';

export default function CreateBudgetPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Pequeña animación de entrada
    setTimeout(() => setIsReady(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500 ${
        isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <InteractiveBudgetChat
            onBack={() => router.push('/dashboard')}
            onComplete={(budgetData) => {
              console.log('✅ Presupuesto creado:', budgetData);
              if (budgetData?.id) {
                router.push(`/dashboard/budget/${budgetData.id}`);
              } else {
                router.push('/dashboard');
              }
            }}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
