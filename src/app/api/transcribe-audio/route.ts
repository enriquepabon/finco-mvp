import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('🎙️ Audio Transcription API - Iniciando transcripción...');

  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('👤 Usuario autenticado:', user.email);

    // Obtener archivo de audio del FormData
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No se encontró archivo de audio' }, { status: 400 });
    }

    console.log('🎵 Procesando audio:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Validar tipo de archivo de audio
    const allowedAudioTypes = [
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/m4a'
    ];

    const isValidAudioType = allowedAudioTypes.some(type => 
      audioFile.type.includes(type.split('/')[1]) || audioFile.type === type
    );

    if (!isValidAudioType) {
      return NextResponse.json({ 
        error: 'Tipo de archivo de audio no soportado. Use WAV, MP3, WebM, OGG, o M4A.' 
      }, { status: 400 });
    }

    // Validar tamaño (máximo 25MB para audio)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json({ 
        error: 'Archivo de audio muy grande. Máximo 25MB permitido.' 
      }, { status: 400 });
    }

    // Validar duración mínima (al menos 0.5 segundos de audio)
    if (audioFile.size < 1000) {
      return NextResponse.json({ 
        error: 'Audio muy corto. Graba al menos 1 segundo de audio.' 
      }, { status: 400 });
    }

    let transcription = '';

    try {
      // Intentar transcripción con diferentes métodos
      transcription = await transcribeWithGemini(audioFile);
      
      if (!transcription || transcription.trim().length < 3) {
        // Fallback a transcripción básica
        transcription = await transcribeWithFallback(audioFile);
      }

      console.log('✅ Transcripción completada:', {
        length: transcription.length,
        preview: transcription.substring(0, 50) + '...'
      });

      return NextResponse.json({
        success: true,
        transcription: transcription,
        fileName: audioFile.name,
        fileType: audioFile.type,
        fileSize: audioFile.size,
        confidence: transcription.includes('[Transcripción automática]') ? 0.7 : 0.9
      });

    } catch (transcriptionError) {
      console.error('❌ Error en transcripción:', transcriptionError);
      
      // Devolver transcripción de fallback
      const fallbackTranscription = await transcribeWithFallback(audioFile);
      
      return NextResponse.json({
        success: true,
        transcription: fallbackTranscription,
        fileName: audioFile.name,
        fileType: audioFile.type,
        fileSize: audioFile.size,
        confidence: 0.5,
        warning: 'Transcripción generada con método de respaldo'
      });
    }

  } catch (error) {
    console.error('❌ Error general en transcripción:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor durante la transcripción' 
    }, { status: 500 });
  }
}

// Función para transcribir con Google Gemini (implementación futura)
async function transcribeWithGemini(audioFile: File): Promise<string> {
  try {
    // Esta sería la implementación con Google Gemini
    // Por ahora, devolvemos un placeholder
    
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioData = new Uint8Array(arrayBuffer);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En una implementación real, enviarías el audio a Gemini
    // const geminiResponse = await geminiClient.transcribeAudio(audioData);
    // return geminiResponse.text;
    
    return `[Transcripción automática] Este es un mensaje de audio de ${Math.round(audioFile.size / 1024)}KB. Para implementar la transcripción completa, necesitas configurar la integración con Google Gemini o un servicio de speech-to-text.`;
    
  } catch (error) {
    console.error('Error en transcripción con Gemini:', error);
    throw new Error('Fallo en transcripción con Gemini');
  }
}

// Función de transcripción de fallback
async function transcribeWithFallback(audioFile: File): Promise<string> {
  try {
    // Información básica del archivo
    const duration = estimateAudioDuration(audioFile.size, audioFile.type);
    
    return `[Nota de voz recibida]

Archivo: ${audioFile.name}
Tamaño: ${Math.round(audioFile.size / 1024)}KB
Duración estimada: ${duration} segundos
Formato: ${audioFile.type}

Para obtener la transcripción automática completa, necesitas configurar un servicio de speech-to-text como:
- Google Cloud Speech-to-Text
- OpenAI Whisper
- Amazon Transcribe
- Microsoft Speech Services

Por favor, describe brevemente lo que dijiste en la nota de voz para que FINCO pueda ayudarte mejor.`;
    
  } catch (error) {
    return `[Nota de voz recibida - ${audioFile.name}]

Se recibió una nota de voz pero no se pudo procesar automáticamente. Por favor, escribe un resumen de lo que dijiste para continuar la conversación.`;
  }
}

// Función auxiliar para estimar duración del audio
function estimateAudioDuration(fileSize: number, mimeType: string): number {
  // Estimación muy básica basada en el tamaño del archivo
  // En una implementación real, usarías librerías para obtener la duración exacta
  
  let bitrate = 128; // kbps por defecto
  
  if (mimeType.includes('webm')) bitrate = 64;
  else if (mimeType.includes('wav')) bitrate = 256;
  else if (mimeType.includes('mp3')) bitrate = 128;
  else if (mimeType.includes('ogg')) bitrate = 96;
  
  // Duración = (tamaño en bytes * 8) / (bitrate * 1000)
  const durationSeconds = Math.round((fileSize * 8) / (bitrate * 1000));
  
  return Math.max(1, durationSeconds); // Mínimo 1 segundo
}

// Función para validar formato de audio
function isValidAudioFormat(file: File): boolean {
  const validFormats = [
    'audio/webm',
    'audio/wav',
    'audio/wave',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'audio/m4a',
    'audio/aac'
  ];
  
  return validFormats.some(format => 
    file.type === format || 
    file.type.includes(format.split('/')[1])
  );
}

// Función para convertir audio a formato compatible (implementación futura)
async function convertAudioFormat(audioFile: File, targetFormat: string): Promise<Blob> {
  // Esta función podría usar librerías como ffmpeg.wasm para convertir formatos
  // Por ahora, devolvemos el archivo original
  return audioFile;
} 