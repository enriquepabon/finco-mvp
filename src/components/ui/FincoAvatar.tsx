'use client'

import React, { useState, useEffect } from 'react'

// Tipos de estados de FINCO
export type FincoExpression = 'idle' | 'thinking' | 'speaking' | 'listening' | 'processing' | 'success' | 'error'

interface FincoAvatarProps {
  expression?: FincoExpression
  isAnimating?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
  onExpressionChange?: (expression: FincoExpression) => void
}

// Componente de la esfera 3D plateada
function FincoSphere3D({ expression, isAnimating, size }: {
  expression: FincoExpression
  isAnimating: boolean
  size: 'small' | 'medium' | 'large'
}) {
  const sizeMap = {
    small: 80,
    medium: 120,
    large: 160
  }

  const sphereSize = sizeMap[size]

  // Configuración de efectos por expresión
  const expressionConfig = {
    idle: {
      glow: '#4FC3F7',
      intensity: '0.3',
      vibration: 'gentle-pulse',
      particles: 3,
      speed: '3s'
    },
    thinking: {
      glow: '#FFB74D',
      intensity: '0.5',
      vibration: 'thinking-vibrate',
      particles: 5,
      speed: '1.5s'
    },
    speaking: {
      glow: '#81C784',
      intensity: '0.7',
      vibration: 'speaking-intense',
      particles: 8,
      speed: '0.3s'
    },
    listening: {
      glow: '#BA68C8',
      intensity: '0.4',
      vibration: 'listening-pulse',
      particles: 4,
      speed: '2s'
    },
    processing: {
      glow: '#64B5F6',
      intensity: '0.8',
      vibration: 'processing-spin',
      particles: 6,
      speed: '1s'
    },
    success: {
      glow: '#4CAF50',
      intensity: '1.0',
      vibration: 'success-bounce',
      particles: 12,
      speed: '0.5s'
    },
    error: {
      glow: '#F44336',
      intensity: '0.6',
      vibration: 'error-shake',
      particles: 2,
      speed: '0.2s'
    }
  }

  const config = expressionConfig[expression]

  return (
    <div className="relative flex items-center justify-center" style={{ perspective: '1000px' }}>
      {/* Ambiente 3D Container */}
      <div 
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
          width: sphereSize,
          height: sphereSize
        }}
      >
        {/* Partículas orbitales 3D */}
        {Array.from({ length: config.particles }).map((_, i) => (
          <div
            key={i}
            className="absolute particle-orbit"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${config.glow}aa, ${config.glow}44)`,
              boxShadow: `0 0 8px ${config.glow}88`,
              animationDuration: config.speed,
              animationDelay: `${i * 0.3}s`,
              transform: `rotateY(${i * (360 / config.particles)}deg) translateZ(${sphereSize * 0.6}px)`,
            }}
          />
        ))}

        {/* Esfera Principal 3D */}
        <div
          className={`sphere-3d ${config.vibration}`}
          style={{
            width: sphereSize,
            height: sphereSize,
            borderRadius: '50%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            background: `
              radial-gradient(circle at 25% 25%, 
                rgba(255,255,255,0.9) 0%, 
                rgba(200,200,200,0.8) 30%, 
                rgba(150,150,150,0.7) 60%, 
                rgba(100,100,100,0.8) 100%
              )
            `,
            boxShadow: `
              inset -20px -20px 50px rgba(0,0,0,0.2),
              inset 20px 20px 50px rgba(255,255,255,0.9),
                             0 0 50px ${config.glow}${Math.floor(parseFloat(config.intensity) * 255).toString(16).padStart(2, '0')},
              0 20px 40px rgba(0,0,0,0.3)
            `,
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          {/* Brillo superior izquierdo */}
          <div
            className="absolute rounded-full"
            style={{
              top: '15%',
              left: '20%',
              width: '30%',
              height: '30%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
              filter: 'blur(2px)',
            }}
          />

          {/* Brillo secundario */}
          <div
            className="absolute rounded-full"
            style={{
              top: '40%',
              left: '10%',
              width: '15%',
              height: '15%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
              filter: 'blur(1px)',
            }}
          />

          {/* Logo FINCO en el centro */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              color: 'rgba(0,0,0,0.7)',
              fontSize: `${sphereSize * 0.25}px`,
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(255,255,255,0.5)',
              transform: 'translateZ(10px)',
            }}
          >
            F
          </div>

          {/* Reflejos dinámicos */}
          <div
            className="absolute inset-0 rounded-full reflection-sweep"
            style={{
              background: `linear-gradient(45deg, 
                transparent 0%, 
                rgba(255,255,255,0.3) 40%, 
                rgba(255,255,255,0.6) 50%, 
                rgba(255,255,255,0.3) 60%, 
                transparent 100%
              )`,
              transform: 'rotate(45deg)',
            }}
          />
        </div>

        {/* Sombra de suelo realista */}
        <div
          className="absolute"
          style={{
            bottom: `-${sphereSize * 0.3}px`,
            left: '10%',
            width: '80%',
            height: '20px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
            filter: 'blur(8px)',
            transform: 'rotateX(90deg) translateZ(-10px)',
          }}
        />
      </div>

      {/* Estilos CSS 3D embebidos */}
      <style jsx>{`
        .sphere-3d {
          animation-fill-mode: both;
        }

        .particle-orbit {
          animation: orbit-3d linear infinite;
        }

        .reflection-sweep {
          animation: sweep-reflection 4s ease-in-out infinite;
        }

        /* Animaciones de vibración */
        .gentle-pulse {
          animation: gentle-pulse 3s ease-in-out infinite;
        }

        .thinking-vibrate {
          animation: thinking-vibrate 0.8s ease-in-out infinite;
        }

        .speaking-intense {
          animation: speaking-intense 0.15s ease-in-out infinite;
        }

        .listening-pulse {
          animation: listening-pulse 2s ease-in-out infinite;
        }

        .processing-spin {
          animation: processing-spin 2s linear infinite;
        }

        .success-bounce {
          animation: success-bounce 0.6s ease-out;
        }

        .error-shake {
          animation: error-shake 0.4s ease-in-out;
        }

        /* Definiciones de keyframes */
        @keyframes gentle-pulse {
          0%, 100% { transform: scale(1) rotateY(0deg); }
          50% { transform: scale(1.02) rotateY(5deg); }
        }

        @keyframes thinking-vibrate {
          0%, 100% { transform: translateX(0px) translateY(0px) rotateZ(0deg); }
          25% { transform: translateX(-1px) translateY(-0.5px) rotateZ(-1deg); }
          75% { transform: translateX(1px) translateY(0.5px) rotateZ(1deg); }
        }

        @keyframes speaking-intense {
          0%, 100% { transform: scale(1) translateX(0px) translateY(0px); }
          10% { transform: scale(1.01) translateX(-1px) translateY(-1px); }
          20% { transform: scale(0.99) translateX(1px) translateY(1px); }
          30% { transform: scale(1.02) translateX(-0.5px) translateY(1px); }
          40% { transform: scale(0.98) translateX(0.5px) translateY(-1px); }
          50% { transform: scale(1.01) translateX(-1px) translateY(0px); }
          60% { transform: scale(1.01) translateX(1px) translateY(-0.5px); }
          70% { transform: scale(0.99) translateX(-0.5px) translateY(0.5px); }
          80% { transform: scale(1.02) translateX(0.5px) translateY(1px); }
          90% { transform: scale(0.98) translateX(-0.5px) translateY(-1px); }
        }

        @keyframes listening-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes processing-spin {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(90deg) rotateX(5deg); }
          50% { transform: rotateY(180deg) rotateX(0deg); }
          75% { transform: rotateY(270deg) rotateX(-5deg); }
          100% { transform: rotateY(360deg) rotateX(0deg); }
        }

        @keyframes success-bounce {
          0% { transform: scale(1) translateY(0px); }
          25% { transform: scale(1.15) translateY(-15px); }
          50% { transform: scale(1.05) translateY(0px); }
          75% { transform: scale(1.1) translateY(-8px); }
          100% { transform: scale(1) translateY(0px); }
        }

        @keyframes error-shake {
          0%, 100% { transform: translateX(0px) rotateZ(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotateZ(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(3px) rotateZ(2deg); }
        }

        @keyframes orbit-3d {
          0% { transform: rotateY(0deg) translateZ(var(--orbit-radius, 60px)) rotateY(0deg); }
          100% { transform: rotateY(360deg) translateZ(var(--orbit-radius, 60px)) rotateY(-360deg); }
        }

        @keyframes sweep-reflection {
          0% { transform: rotate(45deg) translateX(-200%); }
          50% { transform: rotate(45deg) translateX(0%); }
          100% { transform: rotate(45deg) translateX(200%); }
        }
      `}</style>
    </div>
  )
}

// Componente principal del avatar
export default function FincoAvatar({
  expression = 'idle',
  isAnimating = false,
  size = 'medium',
  className = '',
  onExpressionChange
}: FincoAvatarProps) {
  const [currentExpression, setCurrentExpression] = useState<FincoExpression>(expression)

  useEffect(() => {
    setCurrentExpression(expression)
  }, [expression])

  const handleClick = () => {
    if (onExpressionChange) {
      const expressions: FincoExpression[] = ['idle', 'thinking', 'speaking', 'listening', 'processing', 'success']
      const currentIndex = expressions.indexOf(currentExpression)
      const nextExpression = expressions[(currentIndex + 1) % expressions.length]
      setCurrentExpression(nextExpression)
      onExpressionChange(nextExpression)
    }
  }

  return (
    <div 
      className={`finco-avatar ${className}`} 
      onClick={handleClick}
      style={{ cursor: onExpressionChange ? 'pointer' : 'default' }}
    >
      <FincoSphere3D
        expression={currentExpression}
        isAnimating={isAnimating}
        size={size}
      />
    </div>
  )
} 