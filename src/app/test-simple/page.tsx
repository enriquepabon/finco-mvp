'use client'

import React, { useState } from 'react'
import CashbeatFloatingButton from '@/components/ui/CashbeatFloatingButton'
import FincoAvatar from '@/components/ui/FincoAvatar'

export default function TestSimplePage() {
  const [notifications, setNotifications] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🤖 FINCO Chat System - Prueba Simple
          </h1>
          <p className="text-lg text-gray-600">
            Sistema de chat avanzado con avatar 3D plateado y interfaz glassmorphism
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Avatar Test */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Avatar FINCO 3D
            </h2>
            <div className="flex justify-center mb-6">
              <FincoAvatar expression="success" size="large" />
            </div>
            <p className="text-gray-600 text-center">
              Avatar esférico 3D plateado con efectos de iluminación y vibraciones contextuales
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Panel de Control
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => setNotifications(prev => prev + 1)}
                className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                ➕ Agregar Notificación ({notifications})
              </button>
              
              <button
                onClick={() => setNotifications(0)}
                className="w-full p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                disabled={notifications === 0}
              >
                🗑️ Limpiar Notificaciones
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 text-sm">
                💡 <strong>Instrucción:</strong> Haz click en el botón flotante FINCO 
                (esquina inferior derecha) para abrir el chat avanzado.
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            ✅ Estado del Sistema
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">Avatar 3D</div>
              <div className="text-green-600">Funcionando</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">Chat Interface</div>
              <div className="text-green-600">Funcionando</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">Glassmorphism</div>
              <div className="text-green-600">Funcionando</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">Notificaciones</div>
              <div className="text-green-600">Funcionando</div>
            </div>
          </div>
        </div>
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