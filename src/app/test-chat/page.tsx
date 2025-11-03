'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import FincoGlassmorphismChat from '@/components/chat/FincoGlassmorphismChat'
import { MessageCircle, Sparkles, Zap, Heart } from 'lucide-react'

export default function TestChatPage() {
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background con gradiente dinámico */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Efectos de luz animados */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute inset-0"
        />
        
        {/* Partículas flotantes */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="mr-3"
            >
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <h1 className="text-5xl font-bold text-white">
              FINCO Chat
            </h1>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="ml-3"
            >
              <Zap className="w-8 h-8 text-blue-400" />
            </motion.div>
          </div>
          <p className="text-xl text-white/80 mb-2">
            Interfaz de Chat con Glassmorphism
          </p>
          <p className="text-lg text-white/60">
            Experiencia conversacional avanzada con avatar 3D
          </p>
        </motion.div>

        {/* Características */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl"
        >
          {[
            {
              icon: <MessageCircle className="w-6 h-6" />,
              title: 'Glassmorphism UI',
              description: 'Interfaz moderna con efectos de vidrio esmerilado y transparencias'
            },
            {
              icon: <Sparkles className="w-6 h-6" />,
              title: 'Avatar 3D Reactivo',
              description: 'FINCO responde con expresiones contextuales en tiempo real'
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: 'Micro-animaciones',
              description: 'Transiciones fluidas y efectos visuales inmersivos'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}
            >
              <div className="text-blue-400 mb-3">{feature.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Controles del Chat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-6 py-3 rounded-xl bg-blue-600/80 hover:bg-blue-700/80 text-white font-medium transition-colors backdrop-blur-xl border border-blue-400/30"
              style={{
                boxShadow: '0 4px 16px 0 rgba(59, 130, 246, 0.3)'
              }}
            >
              {isChatOpen ? 'Cerrar Chat' : 'Abrir Chat'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMinimized(!isMinimized)}
              disabled={!isChatOpen}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors backdrop-blur-xl border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMinimized ? 'Maximizar' : 'Minimizar'}
            </motion.button>
          </div>

          <p className="text-white/60 text-sm text-center max-w-md">
            Interactúa con FINCO usando las opciones rápidas o escribe tu propia consulta. 
            Observa cómo cambian sus expresiones según el contexto.
          </p>
        </motion.div>

        {/* Información técnica */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 max-w-2xl"
        >
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
            <Heart className="w-5 h-5 text-red-400 mr-2" />
            Tecnologías Utilizadas
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-white/80 font-medium mb-2">Frontend</h4>
              <ul className="text-white/60 space-y-1">
                <li>• React Three Fiber</li>
                <li>• Framer Motion</li>
                <li>• Tailwind CSS</li>
                <li>• TypeScript</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/80 font-medium mb-2">Efectos Visuales</h4>
              <ul className="text-white/60 space-y-1">
                <li>• Glassmorphism CSS</li>
                <li>• Backdrop Blur</li>
                <li>• Micro-animaciones</li>
                <li>• Avatar 3D reactivo</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chat Component */}
      <FincoGlassmorphismChat
        isOpen={isChatOpen}
        isMinimized={isMinimized}
        onClose={() => setIsChatOpen(false)}
        onMinimize={() => setIsMinimized(!isMinimized)}
      />
    </div>
  )
} 