import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de autenticación para Next.js
 *
 * Protege rutas /api/* y /dashboard/* requiriendo autenticación
 * Redirige a /auth/login si el usuario no está autenticado
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Crear cliente de Supabase con el contexto del middleware
  const supabase = createMiddlewareClient({ req, res });

  // Verificar sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Si la ruta es de API y no hay sesión, retornar 401
  if (req.nextUrl.pathname.startsWith('/api')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Usuario autenticado, permitir acceso a API
    return res;
  }

  // Si la ruta es /dashboard y no hay sesión, redirigir a login
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      const redirectUrl = new URL('/auth/login', req.url);
      // Agregar parámetro de redirect para volver después del login
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Usuario autenticado, permitir acceso a dashboard
    return res;
  }

  // Otras rutas no requieren autenticación
  return res;
}

/**
 * Configuración del matcher
 * Define qué rutas deben pasar por este middleware
 */
export const config = {
  matcher: [
    '/api/:path*',      // Proteger todas las rutas de API
    '/dashboard/:path*', // Proteger todas las rutas del dashboard
  ],
};
