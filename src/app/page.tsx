'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase/client';
import CashbeatLogo from '../components/ui/CashbeatLogo';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario acaba de autenticarse y decidir dónde redirigir
    const checkAuthAndRedirect = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && !error) {
          // Verificar si el usuario ya completó el onboarding
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.log('Error obteniendo perfil:', profileError);
            // Si hay error, asumimos que es primera vez
            console.log('🔄 Primera vez detectada, redirigiendo a onboarding');
            router.push('/onboarding');
            return;
          }

          if (profile?.onboarding_completed) {
            // Usuario ya completó onboarding, ir al dashboard
            console.log('🔄 Usuario con onboarding completado, redirigiendo al dashboard');
            router.push('/dashboard');
          } else {
            // Primera vez o onboarding incompleto
            console.log('🔄 Onboarding pendiente, redirigiendo a onboarding');
            router.push('/onboarding');
          }
        }
      } catch (error) {
        console.log('No hay usuario autenticado');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CashbeatLogo variant="main" size="large" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Tu Asistente Financiero
            <span className="text-blue-600 block">Inteligente</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Cashbeat te ayuda a gestionar tus finanzas personales de manera inteligente. 
            Controla gastos, establece metas de ahorro y recibe consejos personalizados 
            con inteligencia artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Comenzar Ahora
            </Link>
            <Link
              href="/auth/login"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Cashbeat?
            </h2>
            <p className="text-lg text-gray-600">
              Funcionalidades diseñadas para simplificar tu vida financiera
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CashbeatLogo variant="chat" size="small" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                IA Conversacional
              </h3>
              <p className="text-gray-600">
                Habla con Cashbeat como si fuera tu asesor financiero personal. 
                Obtén consejos inteligentes y personalizados.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Control de Gastos
              </h3>
              <p className="text-gray-600">
                Registra y categoriza tus gastos automáticamente. 
                Visualiza hacia dónde va tu dinero.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Metas Inteligentes
              </h3>
              <p className="text-gray-600">
                Cashbeat te motiva a alcanzar tus sueños.
                Define metas y recibe estrategias personalizadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Únete a miles de usuarios que ya están mejorando su salud financiera con Cashbeat
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Tu futuro financiero comienza hoy. Es gratis y solo toma 5 minutos.
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Crear Mi Cuenta Gratis
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2025 Cashbeat. Tu asistente financiero inteligente.</p>
        </div>
      </footer>
    </div>
  );
}
