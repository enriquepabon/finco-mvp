'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook para conversaciones bidireccionales por voz
 * Maneja Speech Recognition (entrada) y Speech Synthesis (salida)
 */

interface UseVoiceConversationProps {
  onUserSpeech: (transcript: string) => void;
  onConversationEnd?: () => void;
  autoSpeak?: boolean; // Si debe hablar automáticamente las respuestas
  language?: string;
}

interface VoiceConversationState {
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  error: string | null;
  isSupported: boolean;
}

// Type definitions para Web Speech API
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export function useVoiceConversation({
  onUserSpeech,
  onConversationEnd,
  autoSpeak = true,
  language = 'es-CO'
}: UseVoiceConversationProps) {
  
  const [state, setState] = useState<VoiceConversationState>(() => {
    // Inicialización del estado con check de soporte
    if (typeof window === 'undefined') {
      return {
        isListening: false,
        isSpeaking: false,
        currentTranscript: '',
        error: null,
        isSupported: false
      };
    }

    const windowWithSpeech = window as WindowWithSpeechRecognition;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    const isSupported = !!(SpeechRecognition && SpeechSynthesis);

    return {
      isListening: false,
      isSpeaking: false,
      currentTranscript: '',
      error: null,
      isSupported
    };
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);
  
  // Refs para configuración (evita recrear callbacks)
  const autoSpeakRef = useRef(autoSpeak);
  const languageRef = useRef(language);
  
  // Actualizar refs cuando cambian los props
  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
    languageRef.current = language;
  }, [autoSpeak, language]);

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const windowWithSpeech = window as WindowWithSpeechRecognition;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    const isSupported = !!(SpeechRecognition && SpeechSynthesis);

    if (!isSupported) {
      console.warn('⚠️ Web Speech API no disponible en este navegador');
      return;
    }

    // Inicializar Speech Recognition
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageRef.current;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎙️ Escuchando...');
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Actualizar transcripción en tiempo real
      setState(prev => ({ 
        ...prev, 
        currentTranscript: finalTranscript || interimTranscript 
      }));

      // Si hay transcripción final, enviarla
      if (finalTranscript.trim()) {
        console.log('✅ Transcripción final:', finalTranscript);
        onUserSpeech(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Error en reconocimiento de voz:', event.error);
      let errorMessage = 'Error de reconocimiento de voz';
      
      if (event.error === 'no-speech') {
        errorMessage = 'No se detectó voz. Intenta hablar más alto.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Permisos de micrófono denegados. Por favor, permite el acceso al micrófono.';
      } else if (event.error === 'network') {
        errorMessage = 'Error de conexión. Verifica tu internet o intenta recargar la página.';
        // Auto-retry después de un momento
        setTimeout(() => {
          if (recognitionRef.current && state.isListening) {
            console.log('🔄 Reintentando reconocimiento de voz...');
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error('No se pudo reintentar:', e);
            }
          }
        }, 2000);
      } else if (event.error === 'aborted') {
        errorMessage = 'Reconocimiento cancelado.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'No se puede acceder al micrófono. Verifica que esté conectado.';
      } else if (event.error === 'service-not-allowed') {
        errorMessage = 'Servicio de reconocimiento de voz no disponible en este navegador.';
      }
      
      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
    };

    recognition.onend = () => {
      console.log('🏁 Reconocimiento finalizado');
      setState(prev => ({ ...prev, isListening: false }));
    };

    // Inicializar Speech Synthesis
    synthesisRef.current = SpeechSynthesis;

    // Cargar voces - CRÍTICO: En Chrome las voces se cargan async
    let voicesLoaded = false;
    
    const loadVoices = () => {
      const voices = SpeechSynthesis.getVoices();
      if (voices.length > 0 && !voicesLoaded) {
        voicesLoaded = true;
        voicesLoadedRef.current = true;
        console.log('✅ Voces cargadas:', voices.length);
        
        // Listar voces en español disponibles
        const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
        console.log('🇪🇸 Voces en español disponibles:', spanishVoices.map(v => `${v.name} (${v.lang})`).join(', '));
      }
    };

    // Intentar cargar voces inmediatamente
    loadVoices();

    // Listener para cuando las voces terminen de cargar (crítico en Chrome)
    if (SpeechSynthesis.onvoiceschanged !== undefined) {
      SpeechSynthesis.onvoiceschanged = loadVoices;
    }

    // WORKAROUND para Chrome: Forzar carga de voces
    // Chrome necesita que se llame getVoices() al menos una vez
    setTimeout(() => {
      SpeechSynthesis.getVoices();
      loadVoices();
    }, 100);

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      if (SpeechSynthesis.onvoiceschanged !== undefined) {
        SpeechSynthesis.onvoiceschanged = null;
      }
    };
  }, [onUserSpeech]); // Solo depende de onUserSpeech

  // Iniciar escucha
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setState(prev => ({ ...prev, error: 'Reconocimiento de voz no disponible' }));
      return;
    }

    try {
      // Detener cualquier síntesis en curso
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
        setState(prev => ({ ...prev, isSpeaking: false }));
      }

      setState(prev => ({ ...prev, currentTranscript: '', error: null }));
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error iniciando reconocimiento:', error);
      setState(prev => ({ ...prev, error: 'No se pudo iniciar el reconocimiento de voz' }));
    }
  }, []);

  // Detener escucha
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  // Hablar texto (para respuestas de la IA)
  const speak = useCallback((text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
  }) => {
    if (!synthesisRef.current) {
      console.warn('Speech Synthesis no disponible');
      return;
    }

    console.log('🗣️ Iniciando síntesis de voz:', text.substring(0, 50) + '...');

    // IMPORTANTE: Cancelar y limpiar COMPLETAMENTE cualquier síntesis previa
    if (synthesisRef.current.speaking || synthesisRef.current.pending) {
      console.log('🛑 Cancelando síntesis previa...');
      synthesisRef.current.cancel();
    }

    // Función para intentar hablar
    const attemptSpeak = (retryCount = 0) => {
      if (!synthesisRef.current) return;

      const voices = synthesisRef.current.getVoices();
      console.log(`📋 Voces disponibles (intento ${retryCount + 1}):`, voices.length);
      
      // Si no hay voces y no hemos reintentado más de 10 veces, esperar
      if (voices.length === 0 && retryCount < 10) {
        console.warn(`⚠️ Voces aún no disponibles, reintentando en 500ms... (intento ${retryCount + 1}/10)`);
        setTimeout(() => {
          attemptSpeak(retryCount + 1);
        }, 500);
        return;
      }

      // Si después de 10 intentos no hay voces, proceder de todas formas (usará voz por defecto)
      if (voices.length === 0) {
        console.warn('⚠️ No se pudieron cargar voces, usando voz por defecto del sistema');
      }

      // Crear nueva utterance
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;
      
      // Seleccionar mejor voz en español disponible
      const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
      console.log('🇪🇸 Voces en español encontradas:', spanishVoices.length);
      
      const spanishVoice = voices.find(v => 
        v.lang.startsWith('es-') && (
          v.name.includes('Google') || 
          v.name.includes('Microsoft') ||
          v.name.includes('Paulina') || // macOS
          v.name.includes('Monica') ||  // Windows
          v.name.includes('Diego')      // Google español
        )
      ) || spanishVoices[0]; // Usar primera voz en español disponible

      if (spanishVoice) {
        utterance.voice = spanishVoice;
        console.log('🎤 Usando voz:', spanishVoice.name, '- Lang:', spanishVoice.lang);
      } else {
        console.warn('⚠️ No se encontró voz en español, usando voz por defecto del sistema');
      }

      // Configuración de voz - valores más conservadores para mejor compatibilidad
      utterance.lang = languageRef.current;
      utterance.rate = options?.rate || 1.0;  // Velocidad normal
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;

      // Eventos
      utterance.onstart = () => {
        console.log('✅ AUDIO COMENZÓ A REPRODUCIRSE');
        console.log('🔊 Hablando:', text.substring(0, 50) + '...');
        setState(prev => ({ ...prev, isSpeaking: true, error: null }));
      };

      utterance.onend = () => {
        console.log('✅ AUDIO TERMINÓ DE REPRODUCIRSE');
        console.log('✅ Síntesis completada');
        setState(prev => ({ ...prev, isSpeaking: false }));
        
        if (options?.onEnd) {
          options.onEnd();
        }
        
        // Si autoSpeak está habilitado, reiniciar escucha automáticamente
        if (autoSpeakRef.current) {
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                console.log('🎙️ Reactivando micrófono...');
                setState(prev => ({ ...prev, currentTranscript: '', error: null }));
                recognitionRef.current.start();
              } catch (error) {
                console.error('Error reiniciando reconocimiento:', error);
              }
            }
          }, 500);
        }
      };

      utterance.onerror = (event) => {
        // Errores que podemos ignorar completamente (son "normales" en Chrome/Safari)
        const ignorableErrors = ['canceled', 'interrupted', '', undefined, null, 'unknown'];
        
        if (ignorableErrors.includes(event.error)) {
          // Error vacío o cancelación - MUY común en Chrome/Safari
          // NO es un error real, solo un quirk del navegador
          // Solo hacemos log informativo a nivel debug
          console.debug('ℹ️ SpeechSynthesis event:', event.error || 'empty', '(esto es normal en Chrome/Safari)');
          setState(prev => ({ ...prev, isSpeaking: false }));
          
          // Activar micrófono si autoSpeak está activo
          if (autoSpeakRef.current && options?.onEnd) {
            setTimeout(() => {
              options.onEnd!();
            }, 100);
          }
        } else {
          // Error real (raro pero posible)
          const errorDetails = {
            error: event.error,
            type: event.type,
            message: (event as any).message || 'No message'
          };
          console.error('❌ Error REAL en síntesis (no vacío):', errorDetails);
          setState(prev => ({ ...prev, isSpeaking: false }));
        }
      };

      // Hablar con try-catch
      try {
        console.log('🔊 Llamando synthesisRef.current.speak()...');
        console.log('📊 Estado de speechSynthesis:', {
          speaking: synthesisRef.current.speaking,
          pending: synthesisRef.current.pending,
          paused: synthesisRef.current.paused
        });
        console.log('📝 Utterance configurado:', {
          text: utterance.text.substring(0, 50) + '...',
          lang: utterance.lang,
          rate: utterance.rate,
          pitch: utterance.pitch,
          volume: utterance.volume,
          voice: utterance.voice?.name || 'default'
        });
        
        synthesisRef.current.speak(utterance);
        console.log('✅ speak() llamado exitosamente - esperando evento onstart...');
        
        // Debug: verificar después de 2 segundos si empezó
        setTimeout(() => {
          if (synthesisRef.current) {
            console.log('🔍 Estado después de 2s:', {
              speaking: synthesisRef.current.speaking,
              pending: synthesisRef.current.pending,
              paused: synthesisRef.current.paused
            });
            if (!synthesisRef.current.speaking && !synthesisRef.current.pending) {
              console.error('⚠️ El audio NO se está reproduciendo después de 2 segundos');
              console.log('💡 Posible causa: permisos de audio bloqueados o voces no cargadas');
            }
          }
        }, 2000);
        
      } catch (error) {
        console.error('💥 Excepción al iniciar síntesis:', error);
        setState(prev => ({ ...prev, isSpeaking: false }));
      }
    };

    // Esperar un momento antes de intentar hablar (dar tiempo a cancelación previa)
    setTimeout(attemptSpeak, 100);
    
  }, []); // Sin dependencias externas - todo lo necesario está en refs

  // Detener habla
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  // Interrumpir (detener habla e iniciar escucha)
  const interrupt = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
    
    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          setState(prev => ({ ...prev, currentTranscript: '', error: null }));
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error iniciando reconocimiento:', error);
          setState(prev => ({ ...prev, error: 'No se pudo iniciar el reconocimiento de voz' }));
        }
      }
    }, 200);
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    interrupt
  };
}


