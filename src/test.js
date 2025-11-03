import { HtmlToPdfConverter } from './converter.js';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTests() {
  console.log('🧪 Iniciando pruebas del convertidor HTML a PDF...\n');

  const converter = new HtmlToPdfConverter();
  
  try {
    // Test 1: Convertir archivo de prueba
    console.log('📋 Test 1: Convertir archivo HTML_prueba.html');
    const testFile = path.join(__dirname, '../HTML_prueba.html');
    
    if (!await fs.pathExists(testFile)) {
      console.log('❌ Archivo de prueba no encontrado');
      return;
    }

    const options = {
      format: 'A4',
      landscape: false,
      printBackground: true,
      waitForFonts: true,
      waitUntil: 'networkidle0',
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    };

    console.log('⏳ Convirtiendo archivo...');
    const startTime = Date.now();
    
    const pdfBuffer = await converter.convertFile(testFile, options);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Guardar PDF de prueba
    const outputPath = path.join(__dirname, '../test_output.pdf');
    await fs.writeFile(outputPath, pdfBuffer);
    
    console.log(`✅ Test 1 completado exitosamente`);
    console.log(`   📄 PDF generado: ${pdfBuffer.length} bytes`);
    console.log(`   ⏱️  Tiempo: ${duration} segundos`);
    console.log(`   💾 Guardado en: ${outputPath}\n`);

    // Test 2: Convertir contenido HTML simple
    console.log('📋 Test 2: Convertir contenido HTML simple');
    
    const simpleHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Prueba Simple</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px;
          color: #333;
        }
        .header { 
          background-color: #3b82f6; 
          color: white; 
          padding: 20px; 
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .content {
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 Documento de Prueba</h1>
        <p>Generado por el convertidor HTML a PDF</p>
      </div>
      <div class="content">
        <h2>Características probadas:</h2>
        <ul>
          <li>✅ Estilos CSS integrados</li>
          <li>✅ Fuentes personalizadas</li>
          <li>✅ Colores de fondo</li>
          <li>✅ Emojis y caracteres especiales</li>
          <li>✅ Diseño responsivo</li>
        </ul>
        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-ES')}</p>
      </div>
    </body>
    </html>
    `;

    console.log('⏳ Convirtiendo contenido HTML...');
    const startTime2 = Date.now();
    
    const pdfBuffer2 = await converter.convertContent(simpleHtml, {
      format: 'A4',
      landscape: false,
      printBackground: true,
      margin: { top: '30px', bottom: '30px', left: '30px', right: '30px' }
    });
    
    const endTime2 = Date.now();
    const duration2 = ((endTime2 - startTime2) / 1000).toFixed(2);
    
    // Guardar PDF de prueba
    const outputPath2 = path.join(__dirname, '../test_simple.pdf');
    await fs.writeFile(outputPath2, pdfBuffer2);
    
    console.log(`✅ Test 2 completado exitosamente`);
    console.log(`   📄 PDF generado: ${pdfBuffer2.length} bytes`);
    console.log(`   ⏱️  Tiempo: ${duration2} segundos`);
    console.log(`   💾 Guardado en: ${outputPath2}\n`);

    // Test 3: Información del navegador
    console.log('📋 Test 3: Información del navegador');
    const browserInfo = await converter.getBrowserInfo();
    if (browserInfo) {
      console.log(`✅ Navegador inicializado correctamente`);
      console.log(`   🌐 Versión: ${browserInfo.version}`);
      console.log(`   🤖 User Agent: ${browserInfo.userAgent.substring(0, 80)}...`);
    } else {
      console.log(`⚠️  No se pudo obtener información del navegador`);
    }

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   • Archivo complejo (HTML_prueba.html): ${duration}s`);
    console.log(`   • Contenido HTML simple: ${duration2}s`);
    console.log(`   • Total de archivos PDF generados: 2`);

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cerrar el convertidor
    await converter.close();
    console.log('\n🛑 Convertidor cerrado correctamente');
  }
}

// Ejecutar pruebas
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(() => {
      console.log('\n✅ Script de pruebas finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}
