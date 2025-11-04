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
    const { message, chatHistory = [], attachments = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje es requerido' },
        { status: 400 }
      );
    }

    // Auth is now handled by middleware.ts
    // Create Supabase client (middleware ensures user is authenticated)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user (guaranteed by middleware)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // This should never happen due to middleware, but keep as safety
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
    // Contar solo los mensajes del usuario para determinar en qué pregunta estamos
    const userMessages = chatHistory.filter((msg: any) => msg.role === 'user').length;
    const questionNumber = userMessages + 1; // La próxima pregunta a responder
    
    console.log('🤖 Chat API - Usuario:', user.email, 'Pregunta #:', questionNumber, 'Historial:', chatHistory.length, 'Mensajes usuario:', userMessages, 'Mensaje:', message.substring(0, 50) + '...');

    // Parsear la respuesta del usuario si es una respuesta (no el mensaje inicial)
    let parsedData: Partial<ParsedOnboardingData> = {};
    if (userMessages > 0 && questionNumber <= 9) {
      // Parsear basado en la pregunta que ACABAMOS de responder
      const currentAnswerQuestion = userMessages;
      parsedData = parseOnboardingResponse(currentAnswerQuestion, message);
      logParsingResult(currentAnswerQuestion, message, parsedData);
    }

    // Enviar mensaje a Gemini
    const response = await sendOnboardingMessage(
      message,
      profile || { full_name: user.user_metadata?.full_name, email: user.email },
      chatHistory as ChatMessage[]
    );

    if (!response.success) {
      // En lugar de devolver error 500, devolver el mensaje de error de manera elegante
      return NextResponse.json({
        message: response.message || 'Lo siento, hay un problema temporal. Puedes continuar escribiendo tus respuestas.',
        debug: {
          questionNumber,
          onboardingCompleted: false,
          error: response.error || 'Error de IA'
        }
      });
    }

    // Guardar/actualizar datos parseados si hay información válida
    if (Object.keys(parsedData).length > 0) {
      try {
        const dataToUpdate: any = {
          user_id: user.id,
          ...parsedData,
          updated_at: new Date().toISOString()
        };

        // Si hemos completado todas las 9 preguntas, marcar onboarding como completado
        if (userMessages >= 8) { // 8 mensajes del usuario = 9 preguntas respondidas (incluyendo la inicial)
          dataToUpdate.onboarding_completed = true;
          console.log('🎉 ONBOARDING COMPLETADO - Marcando como finalizado');
        }

        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert(dataToUpdate, {
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
        profileExists: !!profile,
        userMessages,
        totalMessages: chatHistory.length,
        onboardingCompleted: userMessages >= 9
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