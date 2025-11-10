import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('🎤 Recibiendo audio para transcripción...');
    
    // Obtener el audio del FormData
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No se recibió archivo de audio' },
        { status: 400 }
      );
    }

    console.log('📄 Archivo recibido:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    });

    // Convertir el archivo a formato que OpenAI puede procesar
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Crear un nuevo File object con el buffer
    const file = new File([buffer], 'audio.webm', { type: audioFile.type });

    console.log('🚀 Enviando a OpenAI Whisper...');

    // Transcribir con Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'es', // Español
      response_format: 'json',
    });

    console.log('✅ Transcripción exitosa:', transcription.text);

    return NextResponse.json({
      success: true,
      text: transcription.text,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error en transcripción:', error);
    
    // Manejar errores específicos de OpenAI
    if (error?.error?.type === 'invalid_request_error') {
      return NextResponse.json(
        { 
          error: 'Formato de audio no válido',
          details: error.error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al transcribir audio',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
