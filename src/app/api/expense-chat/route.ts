import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/server';
import { sendOnboardingMessage } from '../../../../lib/gemini/client';
import { getExpenseRegistrationPrompt } from '../../../../lib/gemini/specialized-prompts';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
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

    console.log(`💰 Expense Chat API - Usuario: ${user.email} Mensaje: ${message.substring(0, 50)}...`);

    // Usar prompt especializado para gastos
    const specializedPrompt = getExpenseRegistrationPrompt(message, { 
      full_name: user.user_metadata?.full_name, 
      email: user.email 
    });

    let responseMessage = '';

    try {
      const aiResponse = await sendOnboardingMessage(
        specializedPrompt,
        { full_name: user.user_metadata?.full_name, email: user.email },
        chatHistory as ChatMessage[]
      );

      if (aiResponse.success) {
        responseMessage = aiResponse.message;
      } else {
        responseMessage = `Para registrar tu gasto necesito:

• **Monto:** ¿Cuánto gastaste?
• **Categoría:** ¿En qué categoría? (comida, transporte, entretenimiento, etc.)
• **Descripción:** ¿Algún detalle adicional?

Ejemplo: "Gasté 50,000 pesos en almuerzo"`;
      }
    } catch (error) {
      console.error('❌ Error con IA:', error);
      responseMessage = `Para registrar tu gasto necesito:

• **Monto:** ¿Cuánto gastaste?
• **Categoría:** ¿En qué categoría?
• **Descripción:** ¿Algún detalle adicional?`;
    }

    return NextResponse.json({
      message: responseMessage,
      success: true,
      action: 'expense_registration'
    });

  } catch (error) {
    console.error('❌ Error en expense-chat API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 