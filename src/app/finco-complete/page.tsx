'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  MessageCircle, 
  Zap, 
  Shield, 
  Palette,
  Cpu,
  Volume2,
  FileText,
  Camera,
  Brain
} from 'lucide-react'
import CashbeatFloatingButton from '@/components/ui/CashbeatFloatingButton'
import FincoAvatar from '@/components/ui/FincoAvatar'

export default function FincoCompletePage() {
  const [notifications, setNotifications] = useState(0)

  const handleAddNotification = () => {
    setNotifications(prev => prev + 1)
  }

  const handleClearNotifications = () => {
    setNotifications(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <FincoAvatar expression="success" size="large" />
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                FINCO Chat Avanzado
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Asistente Financiero IA con Interfaz Premium
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Fase 6 - Rediseño Completo Finalizado</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
        </motion.div>

        {/* Características principales */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Interfaz Glassmorphism</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Diseño moderno con efectos de vidrio y transparencias elegantes
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Avatar 3D Plateado</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Esfera metálica con efectos de iluminación y vibraciones contextuales
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Burbujas de Acción</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Menú contextual con acciones inteligentes para gestión financiera
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Capacidades Multimodales</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Soporte para voz, documentos e imágenes (próximamente)
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800">IA Conversacional</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Respuestas inteligentes con contexto y personalidad financiera
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Routing Inteligente</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Direccionamiento automático según la intención del usuario
            </p>
          </div>
        </motion.div>

        {/* Demostración interactiva */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-xl mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🎮 Demostración Interactiva
            </h2>
            <p className="text-gray-600">
              Prueba todas las funcionalidades del nuevo sistema de chat FINCO
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Panel de control */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Panel de Control</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleAddNotification}
                  className="w-full p-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all transform hover:scale-105"
                >
                  ➕ Agregar Notificación ({notifications})
                </button>
                
                <button
                  onClick={handleClearNotifications}
                  className="w-full p-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all transform hover:scale-105"
                  disabled={notifications === 0}
                >
                  🗑️ Limpiar Notificaciones
                </button>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Instrucciones</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Haz click en el botón flotante para abrir el chat</li>
                  <li>• Prueba las burbujas de acción contextuales</li>
                  <li>• Observa las animaciones del avatar 3D</li>
                  <li>• Experimenta con las notificaciones</li>
                </ul>
              </div>
            </div>

            {/* Información técnica */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Especificaciones Técnicas</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">Avatar:</span>
                  <span className="font-medium text-gray-800">Esfera 3D CSS</span>
                </div>
                
                <div className="flex justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">Interfaz:</span>
                  <span className="font-medium text-gray-800">Glassmorphism</span>
                </div>
                
                <div className="flex justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">Animaciones:</span>
                  <span className="font-medium text-gray-800">Framer Motion</span>
                </div>
                
                <div className="flex justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">Compatibilidad:</span>
                  <span className="font-medium text-gray-800">100% Navegadores</span>
                </div>
                
                <div className="flex justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">Rendimiento:</span>
                  <span className="font-medium text-gray-800">Optimizado</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Próximas funcionalidades */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-200/50 rounded-3xl p-8 shadow-xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🚀 Próximas Funcionalidades
            </h2>
            <p className="text-gray-600">
              Capacidades avanzadas que se integrarán próximamente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/30 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Reconocimiento de Voz</h4>
              <p className="text-xs text-gray-600">Speech-to-Text en español</p>
            </div>

            <div className="text-center p-4 bg-white/30 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Análisis de Documentos</h4>
              <p className="text-xs text-gray-600">PDF y extractos bancarios</p>
            </div>

            <div className="text-center p-4 bg-white/30 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Captura de Recibos</h4>
              <p className="text-xs text-gray-600">OCR automático de gastos</p>
            </div>

            <div className="text-center p-4 bg-white/30 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">IA Avanzada</h4>
              <p className="text-xs text-gray-600">Gemini 1.5 Pro multimodal</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16 text-gray-500"
        >
          <p className="text-sm">
            ✨ FINCO Chat Avanzado - Rediseño Fase 6 Completado
          </p>
          <p className="text-xs mt-2">
            Interfaz premium con avatar 3D plateado y capacidades multimodales
          </p>
        </motion.div>
      </div>

      {/* Botón flotante FINCO */}
      <CashbeatFloatingButton
        hasNotifications={notifications > 0}
        notificationCount={notifications}
        position="bottom-right"
      />
    </div>
  )
} 