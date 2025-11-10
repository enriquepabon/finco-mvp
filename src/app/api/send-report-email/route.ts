import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Inicializar Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inicializar Resend (solo si existe la API key)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * POST /api/send-report-email
 * Envía el reporte financiero por email
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📧 MentorIA Email API - Iniciando envío de reporte...');

    // Verificar API key de Resend
    if (!resend) {
      console.error('❌ RESEND_API_KEY no configurada');
      return NextResponse.json(
        { 
          error: 'Servicio de email no configurado',
          details: 'RESEND_API_KEY faltante en variables de entorno',
          setup: 'Visita https://resend.com para obtener tu API key'
        },
        { status: 503 }
      );
    }

    // Autenticación
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

    console.log('👤 Usuario autenticado:', user.email);

    // Obtener datos del request
    const body = await request.json();
    const { budgetId, recipientEmail, reportHtml } = body;

    if (!budgetId || !reportHtml) {
      return NextResponse.json(
        { error: 'budgetId y reportHtml son requeridos' },
        { status: 400 }
      );
    }

    // Si no se proporciona recipientEmail, usar el email del usuario logueado
    const finalRecipientEmail = recipientEmail || user.email;

    if (!finalRecipientEmail) {
      return NextResponse.json(
        { error: 'No se pudo determinar el email destinatario' },
        { status: 400 }
      );
    }

    console.log('📋 Budget ID:', budgetId);
    console.log('📧 Email destinatario:', finalRecipientEmail);

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalRecipientEmail)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const userName = profile?.full_name || user.email?.split('@')[0] || 'Usuario';

    // Obtener datos del presupuesto para el subject
    const { data: budget } = await supabaseAdmin
      .from('budgets')
      .select('budget_month, budget_year')
      .eq('id', budgetId)
      .eq('user_id', user.id)
      .single();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthName = budget ? monthNames[budget.budget_month - 1] : 'Mes Actual';
    const year = budget?.budget_year || new Date().getFullYear();

    // Preparar el email
    const emailSubject = `MentorIA - Tu Reporte Financiero de ${monthName} ${year}`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@mentoria.app';

    // Enviar email con Resend
    console.log('📤 Enviando email...');
    
    const { data, error } = await resend.emails.send({
      from: `MentorIA <${fromEmail}>`,
      to: [finalRecipientEmail],
      subject: emailSubject,
      html: reportHtml,
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
      return NextResponse.json(
        { error: 'Error al enviar el email', details: error },
        { status: 500 }
      );
    }

    console.log('✅ Email enviado exitosamente, ID:', data?.id);

    // Guardar registro del email enviado (opcional)
    try {
      await supabaseAdmin.from('report_emails').insert({
        user_id: user.id,
        budget_id: budgetId,
        recipient_email: finalRecipientEmail,
        email_id: data?.id,
        sent_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.warn('⚠️ No se pudo guardar el registro del email:', dbError);
      // No falla la operación si no se puede guardar el registro
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado exitosamente',
      emailId: data?.id,
    });

  } catch (error) {
    console.error('❌ Error en send-report-email API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

