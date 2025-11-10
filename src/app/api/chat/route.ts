/**
 * Financial Onboarding Chat API
 *
 * Main API endpoint for MentorIA's 9-question onboarding flow.
 * Handles AI chat, response parsing, profile persistence, caching, and rate limiting.
 *
 * @module api/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendOnboardingMessage, analyzeOnboardingConversation, ChatMessage } from '@/lib/openai/client';
import { createClient } from '@supabase/supabase-js';
import { env, features } from '@/lib/env';
import {
  parseOnboardingResponse,
  logParsingResult,
  ParsedOnboardingData
} from '@/lib/parsers/onboarding-parser';
import { getCachedResponse, setCachedResponse } from '@/lib/cache/gemini-cache';
import {
  checkRateLimit,
  getIdentifier,
  createRateLimitHeaders,
  createRateLimitError,
} from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { ChatHistory, ChatRequest } from '../../../types/chat';
import { OnboardingData } from '../../../types/onboarding';

/**
 * POST /api/chat
 *
 * Handles onboarding chat messages with AI-powered financial coaching.
 *
 * Flow:
 * 1. Validates request body (message, chatHistory)
 * 2. Authenticates user (via middleware)
 * 3. Applies rate limiting (10 requests / 10 seconds)
 * 4. Fetches user profile from Supabase
 * 5. Determines question number based on chat history
 * 6. Parses user response to structured data
 * 7. Checks cache for AI response (if enabled)
 * 8. Calls Gemini AI if cache miss
 * 9. Caches successful AI response
 * 10. Persists parsed data to user_profiles table
 * 11. Marks onboarding complete after 9 questions
 * 12. Returns AI response with rate limit headers
 *
 * Rate Limit: 10 requests per 10 seconds per user
 * Cache TTL: 1 hour (if enabled)
 * Auth: Required (enforced by middleware)
 *
 * @param {NextRequest} request - Next.js request with JSON body
 * @returns {Promise<NextResponse>} AI response or error
 *
 * @example Request body:
 * {
 *   "message": "Me llamo Juan Pérez",
 *   "chatHistory": [{ role: "assistant", content: "¿Cómo te llamas?" }],
 *   "attachments": []
 * }
 *
 * @example Success response (200):
 * {
 *   "message": "¡Perfecto Juan! ¿Cuántos años tienes?",
 *   "success": true,
 *   "debug": { questionNumber: 2, onboardingCompleted: false } // dev only
 * }
 *
 * @example Rate limit error (429):
 * {
 *   "error": "Demasiadas solicitudes...",
 *   "retryAfter": 10
 * }
 * Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
 */
export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory = [], attachments = [] } = await request.json() as ChatRequest;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje es requerido' },
        { status: 400 }
      );
    }

    // Obtener token de autorización del header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role to validate token
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get authenticated user using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
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

    // ⚠️ NOTA: El parseo incremental está DESACTIVADO
    // Solo se usa el análisis de IA al final (mensaje 8+)
    // Esto evita que datos parciales incorrectos sobreescriban los datos correctos
    let parsedData: Partial<ParsedOnboardingData> = {};
    // Comentado: No parsear durante la conversación
    // if (userMessages > 0 && questionNumber <= 9) {
    //   const currentAnswerQuestion = userMessages;
    //   parsedData = parseOnboardingResponse(currentAnswerQuestion, message);
    //   logParsingResult(currentAnswerQuestion, message, parsedData);
    // }

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

    // 🎯 Si el onboarding está completo (8+ mensajes del usuario), usar IA para analizar TODA la conversación
    let finalProfileData: Partial<OnboardingData> = {};
    let onboardingCompleted = false;

    if (userMessages >= 8) {
      console.log('✅ Onboarding completado - Analizando toda la conversación con IA...');
      
      try {
        // 🤖 Usar GPT-4o-mini para analizar toda la conversación
        const analysisResult = await analyzeOnboardingConversation(
          chatHistory as ChatMessage[],
          { full_name: profile?.full_name, email: user.email }
        );

        if (analysisResult.success && analysisResult.data) {
          console.log('✅ Datos extraídos por IA:', analysisResult.data);
          
          // Validar civil_status (debe estar en español según prompt)
          // BD acepta: 'soltero', 'casado', 'divorciado', 'viudo'
          let sanitizedData = { ...analysisResult.data };
          if (sanitizedData.civil_status) {
            const validStatuses = ['soltero', 'casado', 'divorciado', 'viudo'];
            if (!validStatuses.includes(sanitizedData.civil_status)) {
              console.log(`⚠️ civil_status no válido: "${sanitizedData.civil_status}", omitiendo campo`);
              delete sanitizedData.civil_status;
            }
          }
          
          finalProfileData = sanitizedData;
          onboardingCompleted = true;

          // Guardar perfil completo
          const dataToUpdate: Partial<OnboardingData> & { user_id: string } = {
            user_id: user.id,
            ...finalProfileData,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          };

          const { error: upsertError } = await supabase
            .from('user_profiles')
            .upsert(dataToUpdate, {
              onConflict: 'user_id'
            });

          if (upsertError) {
            console.error('❌ Error guardando perfil:', upsertError);
          } else {
            console.log('🎉 Perfil completo guardado exitosamente!');
          }
        } else {
          console.log('⚠️ Error en análisis de IA:', analysisResult.error);
          // Fallback: usar parseo incremental
          finalProfileData = parsedData;
        }
      } catch (analyzeError) {
        console.error('⚠️ Error al analizar onboarding (no crítico):', analyzeError);
        // Fallback: usar parseo incremental
        finalProfileData = parsedData;
      }
    } else {
      // Durante la conversación (mensajes 1-7):
      // NO guardar datos parciales - esperar al análisis final
      // Esto evita datos incorrectos del parseo incremental
      console.log(`📝 Pregunta ${questionNumber}/9 - Continuando conversación...`);
    }

    // Add rate limit headers to successful response
    const rateLimitHeaders = createRateLimitHeaders(rateLimit);

    return NextResponse.json(
      {
        message: response.message,
        success: true,
        // Información de progreso (necesaria para el frontend)
        debug: {
          questionNumber,
          onboardingCompleted,
          // Info adicional solo en desarrollo
          ...(env.NODE_ENV === 'development' && {
            profileExists: !!profile,
            userMessages,
            totalMessages: chatHistory.length,
            analyzedWithAI: userMessages >= 8
          })
        }
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