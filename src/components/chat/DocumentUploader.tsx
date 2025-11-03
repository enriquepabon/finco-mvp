'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, File, Image, FileText, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentUploaderProps {
  onDocumentProcessed: (content: string, fileName: string, fileType: string) => void;
  disabled?: boolean;
  maxFileSize?: number; // en MB
  acceptedTypes?: string[];
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  content?: string;
  error?: string;
  preview?: string;
}

export default function DocumentUploader({
  onDocumentProcessed,
  disabled = false,
  maxFileSize = 10, // 10MB por defecto
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx']
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const generateFileId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    if (file.size > maxFileSize * 1024 * 1024) {
      return `El archivo es muy grande. Máximo ${maxFileSize}MB permitido.`;
    }

    // Validar tipo
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });

    if (!isValidType) {
      return 'Tipo de archivo no soportado.';
    }

    return null;
  };

  const processFile = async (uploadedFile: UploadedFile): Promise<void> => {
    const { file } = uploadedFile;

    try {
      // Actualizar estado a procesando
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'processing' }
          : f
      ));

      let content = '';
      let preview = '';

      if (file.type.startsWith('image/')) {
        // Procesar imagen
        content = await processImage(file);
        preview = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf') {
        // Procesar PDF
        content = await processPDF(file);
      } else if (file.type.startsWith('text/')) {
        // Procesar archivo de texto
        content = await processTextFile(file);
      } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        // Procesar documento Word (requiere servidor)
        content = await processWordDocument(file);
      } else {
        throw new Error('Tipo de archivo no soportado para procesamiento');
      }

      // Actualizar estado a completado
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'completed', content, preview }
          : f
      ));

      // Notificar contenido procesado
      onDocumentProcessed(content, file.name, file.type);

    } catch (error) {
      console.error('Error procesando archivo:', error);
      
      // Actualizar estado a error
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Error desconocido' }
          : f
      ));
    }
  };

  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Para imágenes, devolvemos información básica
        // En una implementación real, podrías usar OCR (Tesseract.js) aquí
        resolve(`[Imagen: ${file.name}] - Para análisis completo de imagen, se requiere procesamiento con IA visual.`);
      };
      reader.readAsDataURL(file);
    });
  };

  const processPDF = async (file: File): Promise<string> => {
    // Para PDF, necesitaríamos una librería como pdf-parse o PDF.js
    // Por simplicidad, devolvemos un placeholder
    return `[PDF: ${file.name}] - Contenido del PDF requiere procesamiento en servidor.`;
  };

  const processTextFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => reject(new Error('Error leyendo archivo de texto'));
      reader.readAsText(file);
    });
  };

  const processWordDocument = async (file: File): Promise<string> => {
    // Para documentos Word, necesitamos procesamiento en servidor
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error procesando documento en servidor');
      }

      const result = await response.json();
      return result.content || 'No se pudo extraer contenido del documento';
    } catch (error) {
      throw new Error('Error procesando documento Word');
    }
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = validateFile(file);

      const uploadedFile: UploadedFile = {
        id: generateFileId(),
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        status: validationError ? 'error' : 'uploading',
        error: validationError || undefined,
      };

      newFiles.push(uploadedFile);
    }

    setFiles(prev => [...prev, ...newFiles]);

    // Procesar archivos válidos
    for (const uploadedFile of newFiles) {
      if (uploadedFile.status !== 'error') {
        await processFile(uploadedFile);
      }
    }
  }, [maxFileSize, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Limpiar input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const openFileSelector = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="document-uploader">
      {/* Área de drop */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-slate-200 bg-slate-50'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={`w-8 h-8 mb-3 ${
            isDragOver ? 'text-blue-500' : 'text-slate-400'
          }`} />
          
          <p className={`text-sm mb-1 ${
            disabled ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {isDragOver
              ? 'Suelta los archivos aquí'
              : 'Arrastra archivos aquí o haz clic para seleccionar'
            }
          </p>
          
          <p className="text-xs text-slate-400">
            Máximo {maxFileSize}MB • PDF, imágenes, documentos de texto
          </p>
        </div>
      </div>

      {/* Lista de archivos */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  {/* Icono de archivo */}
                  <div className={`p-2 rounded ${
                    file.status === 'completed' ? 'bg-green-100 text-green-600' :
                    file.status === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {getFileIcon(file.type)}
                  </div>

                  {/* Información del archivo */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{file.size}</p>
                    
                    {/* Estado */}
                    {file.status === 'uploading' && (
                      <p className="text-xs text-blue-600">Subiendo...</p>
                    )}
                    {file.status === 'processing' && (
                      <p className="text-xs text-blue-600">Procesando...</p>
                    )}
                    {file.status === 'completed' && (
                      <p className="text-xs text-green-600">✓ Procesado</p>
                    )}
                    {file.status === 'error' && (
                      <p className="text-xs text-red-600">{file.error}</p>
                    )}
                  </div>
                </div>

                {/* Indicadores de estado y controles */}
                <div className="flex items-center space-x-2">
                  {file.status === 'processing' && (
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  )}
                  
                  {file.status === 'completed' && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                  
                  {file.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}

                  {/* Botón de eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Eliminar archivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 