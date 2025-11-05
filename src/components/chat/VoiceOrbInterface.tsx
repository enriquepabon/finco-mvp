'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, MessageSquare } from 'lucide-react';

interface VoiceOrbInterfaceProps {
  onTranscriptionComplete: (transcription: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export default function VoiceOrbInterface({
  onTranscriptionComplete,
  onClose,
  isProcessing = false,
  disabled = false
}: VoiceOrbInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [interimTranscription, setInterimTranscription] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Continuous listening
        recognition.interimResults = true; // Show interim results
        recognition.lang = 'es-ES';

        recognition.onstart = () => {
          console.log('🎙️ Voice recognition started');
          setIsListening(true);
          setError('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimText = '';
          let finalText = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalText += transcript + ' ';
            } else {
              interimText += transcript;
            }
          }

          if (finalText) {
            setTranscription(prev => prev + finalText);
            // Auto-send after final result
            if (finalText.trim()) {
              setTimeout(() => {
                const fullText = transcription + finalText;
                if (fullText.trim()) {
                  onTranscriptionComplete(fullText.trim());
                  setTranscription('');
                  setInterimTranscription('');
                }
              }, 500); // Small delay to capture complete sentence
            }
          }

          setInterimTranscription(interimText);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('❌ Error en transcripción:', event.error);

          if (event.error === 'no-speech') {
            setError('No se detectó voz...');
          } else if (event.error === 'not-allowed') {
            setError('Permisos de micrófono denegados');
            setIsListening(false);
          } else if (event.error === 'network') {
            setError('Error de red. Verifica tu conexión.');
          } else {
            setError(`Error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          console.log('🛑 Voice recognition ended');
          setIsListening(false);
          setInterimTranscription('');
        };

        recognitionRef.current = recognition;
      } else {
        setError('Tu navegador no soporta reconocimiento de voz');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcription]);

  // Auto-start listening on mount
  useEffect(() => {
    if (!disabled) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [disabled]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Simulate audio level (in real app, would use Web Audio API)
  useEffect(() => {
    if (isListening && !isProcessing) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 0.5 + 0.5); // 0.5 to 1.0
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening, isProcessing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
      {/* Close button */}
      <motion.button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Volver al chat de texto"
      >
        <X className="w-6 h-6" />
      </motion.button>

      {/* Switch to text button */}
      <motion.button
        onClick={onClose}
        className="absolute top-6 left-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm font-medium">Modo Texto</span>
      </motion.button>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Animated Voice Orb */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow rings */}
          {isListening && (
            <>
              <motion.div
                className="absolute w-96 h-96 rounded-full bg-purple-500/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute w-80 h-80 rounded-full bg-blue-500/20"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.2, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
            </>
          )}

          {/* Main orb */}
          <motion.div
            className={`relative w-64 h-64 rounded-full flex items-center justify-center shadow-2xl ${
              isListening
                ? 'bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500'
                : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
            }`}
            animate={{
              scale: isListening ? [1, 1 + audioLevel * 0.1, 1] : 1,
            }}
            transition={{
              duration: 0.1,
            }}
          >
            {/* Inner glow */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20"
              animate={{
                opacity: isListening ? [0.2, 0.4, 0.2] : 0.1,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Icon */}
            {isListening ? (
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
              >
                <Mic className="w-24 h-24 text-white" />
              </motion.div>
            ) : (
              <MicOff className="w-24 h-24 text-white/50" />
            )}
          </motion.div>

          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-72 h-72 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </motion.div>
          )}
        </div>

        {/* Status text */}
        <div className="text-center space-y-4 max-w-2xl px-8">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 text-lg"
              >
                {error}
              </motion.div>
            ) : isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white text-xl font-medium"
              >
                Procesando...
              </motion.div>
            ) : isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <p className="text-white/90 text-lg font-medium">
                  Te estoy escuchando...
                </p>
                {(transcription || interimTranscription) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-h-[60px]"
                  >
                    <p className="text-white text-base">
                      {transcription}
                      <span className="text-white/60">{interimTranscription}</span>
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="paused"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white/70 text-lg"
              >
                Micrófono pausado
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control button */}
        <motion.button
          onClick={toggleListening}
          disabled={disabled || !!error}
          className={`px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-900'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isListening ? 'Pausar' : 'Iniciar'}
        </motion.button>

        {/* Instructions */}
        <motion.p
          className="text-white/60 text-sm text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Habla naturalmente. Tus respuestas se enviarán automáticamente cuando termines de hablar.
        </motion.p>
      </div>
    </div>
  );
}
