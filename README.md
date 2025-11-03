# 📄 Conversor HTML a PDF

Una aplicación completa para convertir archivos HTML a PDF con formato perfecto, optimizada especialmente para documentos complejos con gráficos, estilos CSS avanzados y fuentes personalizadas.

## ✨ Características Principales

- **🎯 Conversión de Alta Calidad**: Utiliza Puppeteer con Chrome headless para renderizado perfecto
- **📊 Soporte para Gráficos**: Compatible con Chart.js, D3.js y otros frameworks de visualización
- **🎨 Preservación de Estilos**: Mantiene CSS, fuentes de Google, Tailwind CSS y otros frameworks
- **📱 Interfaz Web Moderna**: UI intuitiva y responsiva con drag & drop
- **⚙️ Opciones Personalizables**: Control total sobre formato, márgenes y orientación
- **🚀 API RESTful**: Endpoints para integración con otras aplicaciones
- **🧪 Archivo de Prueba**: Incluye conversión del archivo HTML_prueba.html

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express
- **Conversión PDF**: Puppeteer (Chrome headless)
- **Frontend**: HTML5 + Tailwind CSS + JavaScript vanilla
- **Manejo de Archivos**: Multer + fs-extra

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18.0.0 o superior
- npm o yarn

### Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd "APP´s Enrique Pabon"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor**
   ```bash
   npm start
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📋 Uso de la Aplicación

### 1. Interfaz Web

La aplicación ofrece tres métodos de conversión:

#### 📁 **Subir Archivo**
- Arrastra y suelta archivos HTML
- O usa el botón "Seleccionar Archivo"
- Configura opciones de formato y márgenes
- Descarga automática del PDF

#### ✏️ **Pegar Contenido**
- Pega código HTML directamente
- Ideal para contenido generado dinámicamente
- Mismas opciones de personalización

#### 🧪 **Archivo de Prueba**
- Convierte el archivo HTML_prueba.html incluido
- Demuestra capacidades con gráficos complejos
- Un clic para probar la funcionalidad

### 2. API REST

#### `POST /convert/file`
Convierte un archivo HTML subido.

**Parámetros:**
- `htmlFile`: Archivo HTML (multipart/form-data)
- `format`: Formato de página (A4, A3, Letter, etc.)
- `landscape`: Orientación (true/false)
- `marginTop/Bottom/Left/Right`: Márgenes personalizados

**Ejemplo con curl:**
```bash
curl -X POST -F "htmlFile=@mi_archivo.html" -F "format=A4" -F "landscape=false" http://localhost:3000/convert/file --output resultado.pdf
```

#### `POST /convert/content`
Convierte contenido HTML directo.

**Body JSON:**
```json
{
  "htmlContent": "<html>...</html>",
  "options": {
    "format": "A4",
    "landscape": false,
    "marginTop": "20px",
    "marginBottom": "20px",
    "marginLeft": "20px",
    "marginRight": "20px"
  }
}
```

#### `POST /convert/test`
Convierte el archivo de prueba incluido.

#### `GET /health`
Verifica el estado del servicio.

## 🧪 Pruebas

### Ejecutar pruebas automáticas:
```bash
npm test
```

### Pruebas manuales:
1. **Archivo de prueba**: Usa la pestaña "Archivo de Prueba" en la web
2. **Archivo personalizado**: Sube tu propio HTML
3. **Contenido directo**: Pega código HTML en la interfaz

## ⚙️ Configuración Avanzada

### Opciones de PDF Disponibles

- **Formatos**: A4, A3, A5, Letter, Legal, Tabloid
- **Orientación**: Vertical (Portrait) / Horizontal (Landscape)
- **Márgenes**: Personalizables en px, mm, cm, in
- **Fondo**: Impresión de colores de fondo habilitada
- **Fuentes**: Espera automática para carga de fuentes web

### Variables de Entorno

```bash
PORT=3000                    # Puerto del servidor
NODE_ENV=production         # Entorno de ejecución
```

### Optimizaciones para Producción

1. **Memoria**: Puppeteer puede usar mucha memoria con archivos complejos
2. **Timeout**: Ajustable para archivos que requieren más tiempo de carga
3. **Recursos externos**: La aplicación permite cargar CSS, fuentes y scripts externos

## 📁 Estructura del Proyecto

```
📦 APP´s Enrique Pabon/
├── 📄 HTML_prueba.html          # Archivo de prueba (tu infografía)
├── 📄 package.json              # Configuración y dependencias
├── 📄 README.md                 # Este archivo
├── 📂 src/
│   ├── 📄 app.js               # Servidor Express principal
│   ├── 📄 converter.js         # Lógica de conversión con Puppeteer
│   └── 📄 test.js              # Script de pruebas
├── 📂 public/
│   ├── 📄 index.html           # Interfaz web
│   └── 📄 script.js            # JavaScript del frontend
├── 📂 uploads/                  # Archivos temporales (auto-creado)
└── 📂 node_modules/            # Dependencias (auto-creado)
```

## 🎯 Casos de Uso Específicos

### Para tu archivo HTML_prueba.html:
- ✅ **Gráficos Chart.js**: Renderizado perfecto de barras y donas
- ✅ **Tailwind CSS**: Todos los estilos preservados
- ✅ **Google Fonts**: Fuente Inter cargada correctamente
- ✅ **Colores de fondo**: Gradientes y colores mantenidos
- ✅ **Layout responsivo**: Diseño adaptado para PDF

### Otros tipos de contenido soportados:
- Documentos técnicos con diagramas
- Reportes con tablas complejas
- Presentaciones web
- Dashboards y análisis de datos
- Facturas y documentos comerciales

## 🔧 Solución de Problemas

### Problemas Comunes:

1. **Gráficos no aparecen**:
   - Verifica que los scripts externos se carguen correctamente
   - Aumenta el timeout de espera

2. **Fuentes incorrectas**:
   - Asegúrate de que las fuentes web estén disponibles
   - Usa fuentes de respaldo en CSS

3. **Estilos faltantes**:
   - Verifica que los CSS externos sean accesibles
   - Considera usar estilos inline para máxima compatibilidad

4. **Error de memoria**:
   - Reduce la complejidad del HTML
   - Cierra pestañas innecesarias del navegador

### Logs y Debugging:

El servidor proporciona logs detallados:
```bash
npm run dev  # Modo desarrollo con auto-reload
```

## 🤝 Contribuciones

Este proyecto está optimizado para tu caso de uso específico, pero puedes:

1. Agregar nuevos formatos de papel
2. Implementar plantillas predefinidas
3. Añadir opciones de compresión PDF
4. Integrar con servicios de almacenamiento en la nube

## 📝 Licencia

MIT License - Libre para uso personal y comercial.

## 🆘 Soporte

Para problemas específicos con tu archivo HTML_prueba.html o otras consultas:

1. Revisa los logs del servidor
2. Usa la función de prueba incluida
3. Verifica que todos los recursos externos estén disponibles

---

**🎉 ¡Disfruta convirtiendo tus archivos HTML a PDF con formato perfecto!**
