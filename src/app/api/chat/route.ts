import { NextRequest, NextResponse } from 'next/server';
import { sendOnboardingMessage, ChatMessage } from '../../../../lib/gemini/client';
import { createClient } from '@supabase/supabase-js';
import { env, features } from '../../../../lib/env';
import {
  parseOnboardingResponse,
  logParsingResult,
  ParsedOnboardingData
} from '../../../../lib/parsers/onboarding-parser';
import { getCachedResponse, setCachedResponse } from '../../../../lib/cache/gemini-cache';
import {
  checkRateLimit,
  getIdentifier,
  createRateLimitHeaders,
  createRateLimitError,
} from '../../../../lib/rate-limit';
import { logger } from '../../../../lib/logger';
import { ChatHistory, ChatRequest } from '../../../types/chat';
import { OnboardingData } from '../../../types/onboarding';

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory = [], attachments = [] } = await request.json() as ChatRequest;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje es requerido' },
        { status: 400 }
      );
    }

    // Auth is now handled by middleware.ts
    // Create Supabase client (middleware ensures user is authenticated)
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

    // Check rate limit (AI endpoint: 10 requests per 10 seconds)
    const identifier = getIdentifier(user.id, request);
    const rateLimit = await checkRateLimit(identifier, 'AI');

    if (!rateLimit.success) {
      const headers = createRateLimitHeaders(rateLimit);
      return NextResponse.json(
        createRateLimitError(rateLimit),
        {
          status: 429,
          headers,
        }
      );
    }

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single() as { data: OnboardingData | null; error: any };

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error obteniendo perfil:', profileError);
      // Continuar sin perfil si hay error (excepto si no existe, que es normal)
    }

    // Determinar el número de pregunta basado en el historial
    // Contar solo los mensajes del usuario para determinar en qué pregunta estamos
    const userMessages = chatHistory.filter((msg) => msg.role === 'user').length;
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

    // Try to get cached response first (if caching is enabled)
    const cacheContext = {
      questionNumber,
      userMessages,
      historyLength: chatHistory.length,
    };

    let aiMessage: string | null = null;

    if (features.caching) {
      aiMessage = await getCachedResponse(message, cacheContext);
    }

    // If cache miss, call Gemini AI
    let response;
    if (!aiMessage) {
      response = await sendOnboardingMessage(
        message,
        profile || { full_name: user.user_metadata?.full_name, email: user.email },
        chatHistory as ChatMessage[]
      );

      // Cache the successful response
      if (response.success && features.caching) {
        await setCachedResponse(message, response.message, cacheContext);
      }
    } else {
      // Use cached response
      response = {
        success: true,
        message: aiMessage,
      };
    }

    if (!response.success) {
      // En lugar de devolver error 500, devolver el mensaje de error de manera elegante
      return NextResponse.json({
        message: response.message || 'Lo siento, hay un problema temporal. Puedes continuar escribiendo tus respuestas.',
        // Debug info solo en desarrollo (nunca exponer errores internos en producción)
        ...(env.NODE_ENV === 'development' && {
          debug: {
            questionNumber,
            onboardingCompleted: false,
            error: response.error || 'Error de IA'
          }
        })
      });
    }

    // Guardar/actualizar datos parseados si hay información válida
    if (Object.keys(parsedData).length > 0) {
      try {
        const dataToUpdate: Partial<OnboardingData> & { user_id: string } = {
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

    // Add rate limit headers to successful response
    const rateLimitHeaders = createRateLimitHeaders(rateLimit);

    return NextResponse.json(
      {
        message: response.message,
        success: true,
        // Debug info solo en desarrollo (NUNCA exponer parsedData - contiene datos financieros sensibles)
        ...(env.NODE_ENV === 'development' && {
          debug: {
            questionNumber,
            // parsedData: REMOVED - contiene información financiera sensible, no debe exponerse
            profileExists: !!profile,
            userMessages,
            totalMessages: chatHistory.length,
            onboardingCompleted: userMessages >= 9
          }
        })
      },
      {
        headers: rateLimitHeaders,
      }
    );

  } catch (error) {
    console.error('❌ Error en chat API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 