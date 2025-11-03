import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';

export class HtmlToPdfConverter {
  constructor() {
    this.browser = null;
    this.isInitialized = false;
  }

  /**
   * Inicializar el navegador Puppeteer
   */
  async initialize() {
    if (this.isInitialized && this.browser) {
      return;
    }

    try {
      console.log('🌐 Iniciando navegador Puppeteer...');
      
      this.browser = await puppeteer.launch({
        headless: 'new', // Usar nuevo modo headless
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security', // Para permitir recursos externos
          '--allow-running-insecure-content'
        ],
        timeout: 60000 // 60 segundos timeout
      });

      this.isInitialized = true;
      console.log('✅ Navegador Puppeteer inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar Puppeteer:', error);
      throw new Error(`Error al inicializar el navegador: ${error.message}`);
    }
  }

  /**
   * Convertir archivo HTML a PDF
   * @param {string} htmlFilePath - Ruta al archivo HTML
   * @param {object} options - Opciones de conversión
   * @returns {Buffer} - Buffer del PDF generado
   */
  async convertFile(htmlFilePath, options = {}) {
    await this.initialize();

    if (!await fs.pathExists(htmlFilePath)) {
      throw new Error(`Archivo no encontrado: ${htmlFilePath}`);
    }

    const page = await this.browser.newPage();
    
    try {
      console.log(`📖 Leyendo archivo: ${htmlFilePath}`);
      
      // Configurar viewport para mejor renderizado
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Configurar user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Navegar al archivo HTML usando file:// protocol
      const fileUrl = `file://${path.resolve(htmlFilePath)}`;
      console.log(`🔗 Navegando a: ${fileUrl}`);
      
      await page.goto(fileUrl, {
        waitUntil: options.waitUntil || 'networkidle0', // Esperar a que se carguen todos los recursos
        timeout: 60000
      });

      // Esperar a que se carguen las fuentes si está habilitado
      if (options.waitForFonts !== false) {
        console.log('⏳ Esperando carga de fuentes...');
        await page.evaluate(() => document.fonts.ready);
      }

      // Esperar a que se rendericen los gráficos de Chart.js si existen
      await this.waitForCharts(page);

      // Configurar media type para pantalla (mejor para gráficos)
      await page.emulateMediaType('screen');

      // Configurar opciones de PDF
      const pdfOptions = this.buildPdfOptions(options);
      
      console.log('🔄 Generando PDF...');
      const pdfBuffer = await page.pdf(pdfOptions);
      
      console.log(`📄 PDF generado: ${pdfBuffer.length} bytes`);
      return pdfBuffer;

    } finally {
      await page.close();
    }
  }

  /**
   * Convertir contenido HTML a PDF
   * @param {string} htmlContent - Contenido HTML como string
   * @param {object} options - Opciones de conversión
   * @returns {Buffer} - Buffer del PDF generado
   */
  async convertContent(htmlContent, options = {}) {
    await this.initialize();

    const page = await this.browser.newPage();
    
    try {
      console.log('📝 Procesando contenido HTML...');
      
      // Configurar viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Configurar user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Establecer el contenido HTML
      await page.setContent(htmlContent, {
        waitUntil: options.waitUntil || 'networkidle0',
        timeout: 60000
      });

      // Esperar a que se carguen las fuentes si está habilitado
      if (options.waitForFonts !== false) {
        console.log('⏳ Esperando carga de fuentes...');
        await page.evaluate(() => document.fonts.ready);
      }

      // Esperar a que se rendericen los gráficos de Chart.js si existen
      await this.waitForCharts(page);

      // Configurar media type para pantalla
      await page.emulateMediaType('screen');

      // Configurar opciones de PDF
      const pdfOptions = this.buildPdfOptions(options);
      
      console.log('🔄 Generando PDF...');
      const pdfBuffer = await page.pdf(pdfOptions);
      
      console.log(`📄 PDF generado: ${pdfBuffer.length} bytes`);
      return pdfBuffer;

    } finally {
      await page.close();
    }
  }

  /**
   * Esperar a que se rendericen los gráficos de Chart.js
   * @param {Page} page - Página de Puppeteer
   */
  async waitForCharts(page) {
    try {
      console.log('📊 Verificando gráficos Chart.js...');
      
      // Esperar a que Chart.js esté disponible y los gráficos se hayan renderizado
      await page.waitForFunction(() => {
        if (typeof Chart === 'undefined') {
          return true; // No hay Chart.js, continuar
        }
        
        // Verificar que todos los canvas con gráficos estén renderizados
        const canvases = document.querySelectorAll('canvas');
        if (canvases.length === 0) {
          return true; // No hay canvas, continuar
        }
        
        // Verificar que todos los canvas tengan contenido
        for (let canvas of canvases) {
          const ctx = canvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const hasContent = imageData.data.some((pixel, index) => {
            // Verificar si hay píxeles no transparentes
            return index % 4 === 3 && pixel > 0; // Canal alpha > 0
          });
          
          if (!hasContent) {
            return false; // Este canvas aún no tiene contenido
          }
        }
        
        return true; // Todos los canvas tienen contenido
      }, { timeout: 10000 });
      
      // Espera adicional para asegurar renderizado completo
      await page.waitForTimeout(2000);
      console.log('✅ Gráficos renderizados correctamente');
      
    } catch (error) {
      console.log('⚠️ Timeout esperando gráficos, continuando...');
      // No es un error crítico, continuar con la generación del PDF
    }
  }

  /**
   * Construir opciones de PDF basadas en los parámetros
   * @param {object} options - Opciones personalizadas
   * @returns {object} - Opciones de PDF para Puppeteer
   */
  buildPdfOptions(options) {
    const defaultOptions = {
      format: 'A4',
      landscape: false,
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      },
      waitForFonts: true,
      timeout: 60000
    };

    return {
      ...defaultOptions,
      ...options,
      margin: {
        ...defaultOptions.margin,
        ...(options.margin || {})
      }
    };
  }

  /**
   * Cerrar el navegador
   */
  async close() {
    if (this.browser) {
      console.log('🛑 Cerrando navegador...');
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      console.log('✅ Navegador cerrado');
    }
  }

  /**
   * Obtener información del navegador
   */
  async getBrowserInfo() {
    if (!this.browser) {
      return null;
    }

    try {
      const version = await this.browser.version();
      const userAgent = await this.browser.userAgent();
      return { version, userAgent };
    } catch (error) {
      console.error('Error obteniendo información del navegador:', error);
      return null;
    }
  }
}

// Instancia singleton para reutilizar el navegador
let converterInstance = null;

export function getConverterInstance() {
  if (!converterInstance) {
    converterInstance = new HtmlToPdfConverter();
  }
  return converterInstance;
}

// Limpiar recursos al cerrar la aplicación
process.on('SIGINT', async () => {
  if (converterInstance) {
    await converterInstance.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (converterInstance) {
    await converterInstance.close();
  }
  process.exit(0);
});
