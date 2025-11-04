import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../lib/env';

export async function POST(request: NextRequest) {
  // 🔒 SEGURIDAD: Este endpoint SOLO está disponible en desarrollo
  if (env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();

    // Mostrar el log en la terminal del servidor con formato claro
    console.log('\n🔍 FRONTEND DEBUG LOG:');
    console.log('⏰ Time:', new Date().toLocaleTimeString());
    console.log('📍 Step:', body.step);

    // Mostrar todos los datos del log
    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'step') {
        console.log(`   ${key}:`, value);
      }
    });

    console.log('─────────────────────────────────────');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error in debug log endpoint:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
} 