'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
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

          if (profileError || !profile?.onboarding_completed) {
            // Primera vez o error al obtener perfil
            router.push('/onboarding');
          } else {
            // Usuario con onboarding completado
            router.push('/dashboard');
          }
        } else {
          // No hay usuario autenticado, mostrar landing de MentorIA
          router.push('/landing');
        }
      } catch (error) {
        // Si hay error, mostrar landing
        console.log('Error verificando autenticación:', error);
        router.push('/landing');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Mostrar un loader mientras se verifica la autenticación
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-light to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
        <p className="text-text-gray">Cargando...</p>
      </div>
    </div>
  );
}


