import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { HtmlToPdfConverter } from './converter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Configuración de multer para archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `html_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/html' || path.extname(file.originalname).toLowerCase() === '.html') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos HTML'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

// Inicializar el convertidor
const converter = new HtmlToPdfConverter();

// Rutas de la API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Convertir HTML desde archivo subido
app.post('/convert/file', upload.single('htmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo HTML' });
    }

    console.log(`📄 Procesando archivo: ${req.file.originalname}`);
    
    const options = {
      format: req.body.format || 'A4',
      landscape: req.body.landscape === 'true',
      printBackground: true,
      waitForFonts: true,
      margin: {
        top: req.body.marginTop || '20px',
        bottom: req.body.marginBottom || '20px',
        left: req.body.marginLeft || '20px',
        right: req.body.marginRight || '20px'
      }
    };

    const pdfBuffer = await converter.convertFile(req.file.path, options);
    
    // Configurar headers para descarga
    const filename = path.basename(req.file.originalname, '.html') + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log(`✅ PDF generado exitosamente: ${filename}`);
    res.send(pdfBuffer);

    // Limpiar archivo temporal
    setTimeout(() => {
      fs.remove(req.file.path).catch(console.error);
    }, 5000);

  } catch (error) {
    console.error('❌ Error al convertir archivo:', error);
    res.status(500).json({ 
      error: 'Error al convertir el archivo HTML a PDF',
      details: error.message 
    });
  }
});

// Convertir HTML desde contenido directo
app.post('/convert/content', async (req, res) => {
  try {
    const { htmlContent, options = {} } = req.body;
    
    if (!htmlContent) {
      return res.status(400).json({ error: 'No se ha proporcionado contenido HTML' });
    }

    console.log('📝 Procesando contenido HTML directo');

    const pdfOptions = {
      format: options.format || 'A4',
      landscape: options.landscape || false,
      printBackground: true,
      waitForFonts: true,
      margin: {
        top: options.marginTop || '20px',
        bottom: options.marginBottom || '20px',
        left: options.marginLeft || '20px',
        right: options.marginRight || '20px'
      }
    };

    const pdfBuffer = await converter.convertContent(htmlContent, pdfOptions);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('✅ PDF generado exitosamente desde contenido');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Error al convertir contenido:', error);
    res.status(500).json({ 
      error: 'Error al convertir el contenido HTML a PDF',
      details: error.message 
    });
  }
});

// Convertir el archivo de prueba específico
app.post('/convert/test', async (req, res) => {
  try {
    const testFile = path.join(__dirname, '../HTML_prueba.html');
    
    if (!await fs.pathExists(testFile)) {
      return res.status(404).json({ error: 'Archivo de prueba no encontrado' });
    }

    console.log('🧪 Convirtiendo archivo de prueba');

    const options = {
      format: 'A4',
      landscape: false,
      printBackground: true,
      waitForFonts: true,
      waitUntil: 'networkidle0', // Esperar a que se carguen todos los recursos
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    };

    const pdfBuffer = await converter.convertFile(testFile, options);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="infografia_agri_machinery.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('✅ Archivo de prueba convertido exitosamente');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Error al convertir archivo de prueba:', error);
    res.status(500).json({ 
      error: 'Error al convertir el archivo de prueba',
      details: error.message 
    });
  }
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'HTML to PDF Converter',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores globales
app.use((error, req, res, next) => {
  console.error('💥 Error no manejado:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message 
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
const server = app.listen(port, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${port}`);
  console.log(`📚 Interfaz web disponible en: http://localhost:${port}`);
  console.log(`🔧 API endpoints:`);
  console.log(`   POST /convert/file - Convertir archivo HTML`);
  console.log(`   POST /convert/content - Convertir contenido HTML`);
  console.log(`   POST /convert/test - Convertir archivo de prueba`);
  console.log(`   GET  /health - Estado del servicio`);
});

// Manejo graceful de cierre
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;
