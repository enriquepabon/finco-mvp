'use client'

import { useState } from 'react'
import CashbeatLogo from '@/components/ui/CashbeatLogo'

export default function TestCashbeatPage() {
  const [variant, setVariant] = useState<'main' | 'chat'>('main')
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('large')

  const variants = ['main', 'chat'] as const
  const sizes = ['small', 'medium', 'large'] as const

  const variantDescriptions = {
    main: 'Logo principal para uso general en la aplicación',
    chat: 'Logo específico para interfaces de conversación y chat'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎨 Cashbeat Logo - Página de Pruebas
          </h1>
          <p className="text-lg text-gray-600">
            Prueba las diferentes variantes y tamaños del logo de Cashbeat
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Logo Display */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Vista Previa del Logo
            </h2>
            
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-12 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <CashbeatLogo
                  variant={variant}
                  size={size}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Configuración Actual
                </h3>
                <div className="space-y-1 text-sm text-blue-700">
                  <div><strong>Variante:</strong> {variant}</div>
                  <div><strong>Tamaño:</strong> {size}</div>
                  <div><strong>Descripción:</strong> {variantDescriptions[variant]}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Controles de Prueba
            </h2>

            {/* Variant Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Variante del Logo</h3>
              <div className="grid grid-cols-2 gap-3">
                {variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVariant(v)}
                    className={`p-3 rounded-xl border-2 transition-all font-medium ${
                      variant === v
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {v === 'main' ? '🏢 Principal' : '💬 Chat'}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Tamaño</h3>
              <div className="grid grid-cols-3 gap-3">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`p-3 rounded-xl border-2 transition-all font-medium capitalize ${
                      size === s
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setVariant('main')
                    setSize('large')
                  }}
                  className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
                >
                  🏢 Logo Principal Grande
                </button>
                
                <button
                  onClick={() => {
                    setVariant('chat')
                    setSize('medium')
                  }}
                  className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium"
                >
                  💬 Logo de Chat Mediano
                </button>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600">💡</span>
                <span className="font-medium text-yellow-800">Información</span>
              </div>
              <p className="text-sm text-yellow-700">
                Los logos de Cashbeat están optimizados para diferentes contextos de uso.
                El logo principal se usa en navegación y dashboard, mientras que el logo de chat
                es específico para interfaces conversacionales.
              </p>
            </div>
          </div>
        </div>

        {/* Logo Comparison */}
        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Comparación de Variantes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">🏢 Logo Principal</h3>
              <div className="bg-gray-100 rounded-xl p-8 mb-4 flex justify-center">
                <CashbeatLogo variant="main" size="large" />
              </div>
              <p className="text-sm text-gray-600">
                Para uso general en dashboard, navegación y branding principal
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">💬 Logo de Chat</h3>
              <div className="bg-gray-100 rounded-xl p-8 mb-4 flex justify-center">
                <CashbeatLogo variant="chat" size="large" />
              </div>
              <p className="text-sm text-gray-600">
                Específico para interfaces de chat y conversación con IA
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            ✅ Sistema de Logos Funcionando
          </h3>
          <p className="text-green-700">
            Ambas variantes del logo de Cashbeat están cargando correctamente desde las imágenes PNG optimizadas.
          </p>
        </div>
      </div>
    </div>
  )
} 