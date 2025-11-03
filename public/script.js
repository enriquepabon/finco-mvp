// Variables globales
let selectedFile = null;
let currentTab = 'file';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateProgressBar(0);
});

// Configurar event listeners
function setupEventListeners() {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

// Funciones de manejo de archivos
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDragOver(e) {
    document.getElementById('upload-area').classList.add('dragover');
}

function handleDragLeave(e) {
    document.getElementById('upload-area').classList.remove('dragover');
}

function handleFileDrop(e) {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    // Validar tipo de archivo
    if (!file.name.toLowerCase().endsWith('.html')) {
        showMessage('Error: Solo se permiten archivos HTML', 'error');
        return;
    }
    
    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
        showMessage('Error: El archivo es demasiado grande (máximo 10MB)', 'error');
        return;
    }
    
    selectedFile = file;
    showFileInfo(file);
    document.getElementById('convert-file-btn').disabled = false;
    
    showMessage('✅ Archivo seleccionado correctamente', 'success');
}

function showFileInfo(file) {
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    
    fileName.textContent = file.name;
    fileSize.textContent = `(${formatFileSize(file.size)})`;
    fileInfo.classList.remove('hidden');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Funciones de tabs
function switchTab(tabName) {
    // Ocultar todos los paneles
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // Remover clase activa de todos los tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active', 'border-blue-500', 'text-blue-600');
        button.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Mostrar panel seleccionado
    document.getElementById(`${tabName}-panel`).classList.remove('hidden');
    
    // Activar tab seleccionado
    const activeTab = document.getElementById(`${tabName}-tab`);
    activeTab.classList.add('active', 'border-blue-500', 'text-blue-600');
    activeTab.classList.remove('border-transparent', 'text-gray-500');
    
    currentTab = tabName;
}

// Funciones de conversión
async function convertFile() {
    if (!selectedFile) {
        showMessage('Error: No se ha seleccionado ningún archivo', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('htmlFile', selectedFile);
    
    // Obtener opciones
    const options = getFileOptions();
    Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
    });
    
    await performConversion('/convert/file', formData, selectedFile.name.replace('.html', '.pdf'));
}

async function convertContent() {
    const htmlContent = document.getElementById('html-content').value.trim();
    
    if (!htmlContent) {
        showMessage('Error: No se ha proporcionado contenido HTML', 'error');
        return;
    }
    
    const options = getContentOptions();
    const data = {
        htmlContent: htmlContent,
        options: options
    };
    
    await performConversion('/convert/content', data, 'converted.pdf', 'json');
}

async function convertTest() {
    await performConversion('/convert/test', {}, 'infografia_agri_machinery.pdf', 'json');
}

function getFileOptions() {
    return {
        format: document.getElementById('file-format').value,
        landscape: document.getElementById('file-landscape').value,
        marginTop: document.getElementById('file-margin-top').value,
        marginBottom: document.getElementById('file-margin-bottom').value,
        marginLeft: document.getElementById('file-margin-left').value,
        marginRight: document.getElementById('file-margin-right').value
    };
}

function getContentOptions() {
    return {
        format: document.getElementById('content-format').value,
        landscape: document.getElementById('content-landscape').value === 'true',
        marginTop: document.getElementById('content-margin-top').value,
        marginBottom: document.getElementById('content-margin-bottom').value,
        marginLeft: document.getElementById('content-margin-left').value,
        marginRight: document.getElementById('content-margin-right').value
    };
}

async function performConversion(endpoint, data, filename, contentType = 'formdata') {
    showLoading(true);
    updateLoadingStatus('Iniciando conversión...');
    updateProgressBar(10);
    
    try {
        const options = {
            method: 'POST'
        };
        
        if (contentType === 'json') {
            options.headers = {
                'Content-Type': 'application/json'
            };
            options.body = JSON.stringify(data);
        } else {
            options.body = data;
        }
        
        updateLoadingStatus('Enviando datos al servidor...');
        updateProgressBar(30);
        
        const response = await fetch(endpoint, options);
        
        updateLoadingStatus('Procesando archivo HTML...');
        updateProgressBar(50);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }
        
        updateLoadingStatus('Generando PDF...');
        updateProgressBar(80);
        
        const blob = await response.blob();
        
        updateLoadingStatus('Preparando descarga...');
        updateProgressBar(95);
        
        // Descargar archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        updateProgressBar(100);
        updateLoadingStatus('¡Conversión completada!');
        
        setTimeout(() => {
            showLoading(false);
            showMessage('✅ PDF generado y descargado exitosamente', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Error en la conversión:', error);
        showLoading(false);
        showMessage(`❌ Error: ${error.message}`, 'error');
    }
}

// Funciones de UI
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('active');
        updateProgressBar(0);
    } else {
        loading.classList.remove('active');
    }
}

function updateLoadingStatus(status) {
    document.getElementById('loading-status').textContent = status;
}

function updateProgressBar(percentage) {
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${percentage}%`;
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    
    // Limpiar clases anteriores
    messageDiv.className = 'fixed top-4 right-4 max-w-md z-50 p-4 rounded-lg shadow-lg';
    
    // Agregar clases según el tipo
    if (type === 'success') {
        messageDiv.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700');
    } else if (type === 'error') {
        messageDiv.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700');
    } else {
        messageDiv.classList.add('bg-blue-100', 'border', 'border-blue-400', 'text-blue-700');
    }
    
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}

// Función para mostrar información del sistema
async function checkHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('Estado del servidor:', data);
        return data.status === 'ok';
    } catch (error) {
        console.error('Error verificando el estado del servidor:', error);
        return false;
    }
}

// Verificar estado del servidor al cargar
checkHealth().then(isHealthy => {
    if (!isHealthy) {
        showMessage('⚠️ Problema conectando con el servidor', 'error');
    }
});

// Funciones de utilidad para debugging
window.debugInfo = {
    currentTab,
    selectedFile,
    checkHealth,
    getFileOptions,
    getContentOptions
};
