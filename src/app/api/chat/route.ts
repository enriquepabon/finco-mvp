import { NextRequest, NextResponse } from 'next/server';
import { sendOnboardingMessage, ChatMessage } from '../../../../lib/gemini/client';
import { createClient } from '@supabase/supabase-js';
import { 
  parseOnboardingResponse, 
  logParsingResult, 
  ParsedOnboardingData 
} from '../../../../lib/parsers/onboarding-parser';

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory, userToken } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje es requerido' },
        { status: 400 }
      );
    }

    if (!userToken) {
      return NextResponse.json(
        { error: 'Token de usuario requerido' },
        { status: 401 }
      );
    }

    // Crear cliente de Supabase con el token del usuario
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error obteniendo perfil:', profileError);
      // Continuar sin perfil si hay error (excepto si no existe, que es normal)
    }

    // Determinar el número de pregunta basado en el historial
    const questionNumber = Math.floor(chatHistory.length / 2) + 1;
    
    console.log('🤖 Chat API - Usuario:', user.email, 'Pregunta #:', questionNumber, 'Mensaje:', message.substring(0, 50) + '...');

    // Parsear la respuesta del usuario si es una respuesta (no el mensaje inicial)
    let parsedData: Partial<ParsedOnboardingData> = {};
    if (chatHistory.length > 0 && questionNumber <= 9) {
      parsedData = parseOnboardingResponse(questionNumber, message);
      logParsingResult(questionNumber, message, parsedData);
    }

    // Enviar mensaje a Gemini
    const response = await sendOnboardingMessage(
      message,
      profile || { full_name: user.user_metadata?.full_name, email: user.email },
      chatHistory as ChatMessage[]
    );

    if (!response.success) {
      return NextResponse.json(
        { error: 'Error al procesar el mensaje' },
        { status: 500 }
      );
    }

    // Guardar/actualizar datos parseados si hay información válida
    if (Object.keys(parsedData).length > 0) {
      try {
        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            ...parsedData,
            // Marcar como completado si es la última pregunta
            onboarding_completed: questionNumber >= 9
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          console.error('❌ Error guardando perfil:', upsertError);
        } else {
          console.log('✅ Perfil actualizado:', { user_id: user.id, questionNumber, parsedData });
        }
      } catch (saveError) {
        console.error('❌ Error al guardar datos:', saveError);
        // No retornamos error para no interrumpir la conversación
      }
    }

    return NextResponse.json({
      message: response.message,
      success: true,
      // Información adicional para debugging
      debug: {
        questionNumber,
        parsedData,
        profileExists: !!profile
      }
    });

  } catch (error) {
    console.error('❌ Error en chat API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 