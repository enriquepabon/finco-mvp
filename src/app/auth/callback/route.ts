import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const access_token = requestUrl.searchParams.get('access_token')
  const refresh_token = requestUrl.searchParams.get('refresh_token')

  console.log('🔍 Callback called with:', { 
    code: code ? 'present' : 'missing', 
    error,
    access_token: access_token ? 'present' : 'missing',
    refresh_token: refresh_token ? 'present' : 'missing',
    allParams: Object.fromEntries(requestUrl.searchParams.entries())
  })

  // Si hay un error de OAuth, redirigir con el error
  if (error) {
    console.error('❌ OAuth error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=oauth_error`)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Caso 1: Tenemos código de autorización (flujo PKCE)
  if (code) {
    try {
      console.log('🔄 Attempting to exchange code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Error exchanging code for session:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_error&details=${encodeURIComponent(error.message)}`)
      }
      
      if (data?.session) {
        console.log('✅ Session created successfully via code exchange, redirecting to dashboard')
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error('❌ Exception during code exchange:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_exception`)
    }
  }

  // Caso 2: Tenemos tokens directamente (flujo implícito)
  if (access_token) {
    try {
      console.log('🔄 Setting session with access token...')
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || ''
      })
      
      if (error) {
        console.error('❌ Error setting session with tokens:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=token_error`)
      }
      
      if (data?.session) {
        console.log('✅ Session set successfully via tokens, redirecting to dashboard')
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error('❌ Exception during token session:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=token_exception`)
    }
  }

  // Caso 3: Verificar si ya hay una sesión activa
  try {
    console.log('🔄 Checking for existing session...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (session && !error) {
      console.log('✅ Found existing session, redirecting to dashboard')
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    }
  } catch (error) {
    console.error('❌ Error checking session:', error)
  }

  // Si llegamos aquí, no pudimos establecer una sesión
  console.log('❌ No code, no tokens, no session - redirecting to login')
  return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=no_session`)
} 