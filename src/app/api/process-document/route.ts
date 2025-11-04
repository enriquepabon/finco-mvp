import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('📄 Document Processing API - Iniciando procesamiento...');

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

    // Obtener archivo del FormData
    const formData = await request.formData();
    const file = formData.get('document') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se encontró archivo' }, { status: 400 });
    }

    console.log('📎 Procesando archivo:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no soportado. Use PDF, Word, o archivos de texto.' 
      }, { status: 400 });
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Archivo muy grande. Máximo 10MB permitido.' 
      }, { status: 400 });
    }

    let extractedContent = '';

    try {
      if (file.type === 'application/pdf') {
        extractedContent = await processPDF(file);
      } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        extractedContent = await processWordDocument(file);
      } else if (file.type.startsWith('text/')) {
        extractedContent = await processTextFile(file);
      } else {
        throw new Error('Tipo de archivo no implementado');
      }

      console.log('✅ Contenido extraído exitosamente:', {
        length: extractedContent.length,
        preview: extractedContent.substring(0, 100) + '...'
      });

      return NextResponse.json({
        success: true,
        content: extractedContent,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

    } catch (processingError) {
      console.error('❌ Error procesando archivo:', processingError);
      return NextResponse.json({
        error: process.env.NODE_ENV === 'development'
          ? `Error procesando ${file.name}: ${processingError instanceof Error ? processingError.message : 'Error desconocido'}`
          : 'Error procesando el documento. Por favor intenta con otro archivo.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error general en API:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// Función para procesar archivos PDF
async function processPDF(file: File): Promise<string> {
  // Para una implementación completa, necesitarías instalar pdf-parse:
  // npm install pdf-parse
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Por ahora, devolvemos un placeholder
    // En producción, usarías algo como:
    // const pdfParse = require('pdf-parse');
    // const data = await pdfParse(buffer);
    // return data.text;
    
    return `[Contenido PDF: ${file.name}]
    
Este es un placeholder para el contenido del PDF. Para implementar completamente el procesamiento de PDF, necesitas instalar la librería 'pdf-parse' y configurar el servidor.

El archivo contiene ${Math.round(buffer.length / 1024)}KB de datos.

Para FINCO, este documento puede contener información financiera importante como:
- Estados de cuenta bancarios
- Facturas y recibos
- Informes financieros
- Presupuestos existentes
- Documentos de inversiones

Por favor, describe brevemente el contenido del documento para que pueda ayudarte mejor.`;

  } catch (error) {
    throw new Error('Error leyendo archivo PDF');
  }
}

// Función para procesar documentos Word
async function processWordDocument(file: File): Promise<string> {
  // Para una implementación completa, necesitarías instalar mammoth:
  // npm install mammoth
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Por ahora, devolvemos un placeholder
    // En producción, usarías algo como:
    // const mammoth = require('mammoth');
    // const result = await mammoth.extractRawText({ buffer });
    // return result.value;
    
    return `[Documento Word: ${file.name}]
    
Este es un placeholder para el contenido del documento Word. Para implementar completamente el procesamiento de documentos Word, necesitas instalar la librería 'mammoth' y configurar el servidor.

El archivo contiene ${Math.round(buffer.length / 1024)}KB de datos.

Para FINCO, este documento puede contener:
- Presupuestos personales
- Listas de gastos
- Planes financieros
- Notas sobre objetivos financieros
- Registros de ingresos y gastos

Por favor, describe brevemente el contenido del documento para que pueda ayudarte mejor con tu análisis financiero.`;

  } catch (error) {
    throw new Error('Error leyendo documento Word');
  }
}

// Función para procesar archivos de texto
async function processTextFile(file: File): Promise<string> {
  try {
    const text = await file.text();
    
    if (!text.trim()) {
      throw new Error('El archivo de texto está vacío');
    }

    // Agregar contexto para FINCO
    return `[Archivo de texto: ${file.name}]

${text}

[Fin del documento]`;

  } catch (error) {
    throw new Error('Error leyendo archivo de texto');
  }
} 