import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/server';
import { sendOnboardingMessage } from '../../../../lib/gemini/client';
import { getProfileEditPrompt } from '../../../../lib/gemini/specialized-prompts';
import { processAIUpdate } from '../../../../lib/parsers/ai-response-parser';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje es requerido' },
        { status: 400 }
      );
    }

    // Obtener usuario autenticado
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autorizado' },
        { status: 401 }
      );
    }

    console.log('🤖 Profile Edit Chat API - Usuario:', user.email, 'Mensaje:', message.substring(0, 50) + '...');

    // Obtener perfil actual del usuario
    const { data: currentProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError);
      return NextResponse.json(
        { error: 'Error obteniendo perfil del usuario' },
        { status: 500 }
      );
    }

    // Usar prompt especializado con perfil actual
    const specializedPrompt = getProfileEditPrompt(message, { 
      full_name: user.user_metadata?.full_name, 
      email: user.email 
    }, currentProfile);

    let responseMessage = '';
    let profileUpdated = false;
    let updatedProfile = null;

    try {
      // Enviar mensaje a la IA
      const aiResponse = await sendOnboardingMessage(
        specializedPrompt,
        { full_name: user.user_metadata?.full_name, email: user.email },
        chatHistory as ChatMessage[]
      );

      if (aiResponse.success) {
        console.log('✅ Respuesta de IA recibida:', aiResponse.message.substring(0, 100) + '...');
        
        // Procesar respuesta estructurada de la IA
        const updateResult = processAIUpdate(aiResponse.message);
        console.log('🔍 Resultado del parsing:', JSON.stringify(updateResult, null, 2));
        
        if (updateResult.success && updateResult.updateData) {
          console.log('🔄 Actualizando perfil con:', updateResult.updateData);
          console.log('👤 Usuario ID:', user.id);
          
          // Actualizar en la base de datos
          const { data, error: updateError } = await supabaseAdmin
            .from('user_profiles')
            .update(updateResult.updateData)
            .eq('user_id', user.id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Error actualizando perfil:', updateError);
            responseMessage = 'Hubo un error al actualizar tu información. Por favor, inténtalo de nuevo.';
          } else {
            console.log('✅ Perfil actualizado exitosamente:', data);
            updatedProfile = data;
            profileUpdated = true;
            
            // Usar la explicación de la IA + mensaje de confirmación
            responseMessage = `${updateResult.explanation}

✅ **Actualización completada exitosamente**

¿Te gustaría actualizar algún otro campo? Puedes decirme:
• "Mis ingresos son 25 millones"
• "Mi edad es 40 años"
• "Tengo activos por 15 millones"`;
          }
        } else {
          console.log('⚠️ No se detectó actualización:', updateResult.error);
          // La IA no detectó una actualización, usar su respuesta directamente
          responseMessage = aiResponse.message;
        }
      } else {
        responseMessage = `No pude procesar tu solicitud. ¿Podrías ser más específico?

Por ejemplo:
• "Mis activos son 15 millones"
• "Mi edad es 40 años"
• "Mi estado civil es casado"`;
      }
    } catch (error) {
      console.error('❌ Error con IA:', error);
      responseMessage = `No pude procesar tu solicitud. ¿Podrías ser más específico?

Por ejemplo:
• "Mis activos son 15 millones"  
• "Mi edad es 40 años"
• "Mi estado civil es casado"`;
    }

    return NextResponse.json({
      message: responseMessage,
      success: true,
      profileUpdated,
      updatedProfile: profileUpdated ? updatedProfile : null
    });

  } catch (error) {
    console.error('❌ Error en profile-edit-chat API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 