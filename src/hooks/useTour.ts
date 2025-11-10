'use client';

import { useEffect, useRef } from 'react';
import { driver, DriveStep, Config } from 'driver.js';
import 'driver.js/dist/driver.css';

interface UseTourOptions {
  tourId: string;
  steps: DriveStep[];
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useTour({ tourId, steps, onComplete, autoStart = false }: UseTourOptions) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Inicializar driver solo una vez
    if (!driverRef.current) {
      const driverConfig: Config = {
        showProgress: true,
        progressText: '{{current}} de {{total}}',
        nextBtnText: 'Siguiente →',
        prevBtnText: '← Anterior',
        doneBtnText: '¡Entendido!',
        showButtons: ['next', 'previous', 'close'],
        steps,
        onDestroyed: () => {
          if (onComplete) {
            onComplete();
          }
          // Marcar como visto
          localStorage.setItem(`tour_${tourId}_completed`, 'true');
        },
        popoverClass: 'mentoria-tour-popover',
        smoothScroll: true,
      };

      driverRef.current = driver(driverConfig);
    }

    // Auto-iniciar el tour si es la primera vez y autoStart está activado
    if (autoStart && !hasStartedRef.current) {
      const hasSeenTour = localStorage.getItem(`tour_${tourId}_completed`);
      
      if (!hasSeenTour) {
        // Esperar un poco para que el DOM esté listo
        const timer = setTimeout(() => {
          driverRef.current?.drive();
          hasStartedRef.current = true;
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [tourId, steps, onComplete, autoStart]);

  const startTour = () => {
    driverRef.current?.drive();
  };

  const resetTour = () => {
    localStorage.removeItem(`tour_${tourId}_completed`);
    driverRef.current?.drive();
  };

  return {
    startTour,
    resetTour,
  };
}

