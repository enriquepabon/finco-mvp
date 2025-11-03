'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  MessageCircle, 
  Zap, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react'
import CashbeatLogo from '@/components/ui/CashbeatLogo'
import { useRouter } from 'next/navigation'

export default function CashbeatDemoPage() {
  const [currentVariant, setCurrentVariant] = useState<'main' | 'chat'>('main')
  const router = useRouter()

  const features = [
    {
      icon: <ImageIcon className="w-6 h-6" />,
      title: "Logo Principal",
      description: "Logo limpio y profesional para uso general en la aplicación",
      status: "Completado"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Logo de Chat",
      description: "Versión específica del logo para interfaces de conversación",
      status: "Completado"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Integración Dashboard",
      description: "Logo integrado en el header del dashboard principal",
      status: "Completado"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Branding Actualizado",
      description: "Cambio completo de FINCO a Cashbeat en toda la aplicación",
      status: "Completado"
    }
  ]

  const logoVariants = [
    { value: 'main', label: '🏢 Logo Principal', description: 'Logo general para dashboard y navegación' },
    { value: 'chat', label: '💬 Logo de Chat', description: 'Logo específico para interfaces de chat' }
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative mb-4">
              <CashbeatLogo variant="main" size="large" />
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl" />
            </div>
            <p className="text-xl text-gray-600 text-center">
              Rebranding Completado
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Logo Actualizado + Dashboard Integrado</span>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105"
            >
              Ver Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/test-finco')}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105"
            >
              Probar Chat <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Logo Demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-xl mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🎨 Demostración de Logos
            </h2>
            <p className="text-gray-600">
              Haz click en las variantes para ver los diferentes logos de Cashbeat
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Logo Display */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-12 mb-6 border-2 border-dashed border-gray-300">
                <CashbeatLogo
                  variant={currentVariant}
                  size="large"
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {logoVariants.find(v => v.value === currentVariant)?.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {logoVariants.find(v => v.value === currentVariant)?.description}
                </p>
              </div>
            </div>

            {/* Variant Controls */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Selecciona una Variante
              </h3>
              {logoVariants.map((variant) => (
                <button
                  key={variant.value}
                  onClick={() => setCurrentVariant(variant.value)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    currentVariant === variant.value
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{variant.label}</div>
                  <div className="text-sm opacity-75 mt-1">{variant.description}</div>
                </button>
              ))}
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Información</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Los logos han sido optimizados para diferentes contextos de uso en la aplicación.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <div key={feature.title} className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    ✅ {feature.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Status Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-200/50 rounded-3xl p-8 shadow-xl text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            🎉 Rebranding Completado Exitosamente
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            La aplicación ha sido rebrandeada completamente de FINCO a <strong>Cashbeat</strong>. 
            Los nuevos logos han sido integrados en toda la aplicación con un diseño limpio y profesional.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600">Rebranding</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-600">Variantes Logo</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Dashboard</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">PNG</div>
              <div className="text-sm text-gray-600">Optimizado</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 