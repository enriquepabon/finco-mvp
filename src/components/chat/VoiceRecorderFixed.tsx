'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Send, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export default function VoiceRecorderFixed({ 
  onTranscriptionComplete, 
  onAudioRecorded, 
  disabled = false 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError('');
      setTranscription('');
      setAudioBlob(null);
      setRecordingTime(0);

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Configurar MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/wav';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        
        // Crear URL para reproducción
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const newAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newAudioUrl);

        // Notificar que se grabó audio
        onAudioRecorded(audioBlob);
      };

      // Iniciar grabación
      mediaRecorderRef.current.start(250);
      setIsRecording(true);

      // Iniciar transcripción simultánea
      startTranscription();

      // Iniciar timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error iniciando grabación:', error);
      setError('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Detener transcripción
      stopTranscription();

      // Detener stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Limpiar timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const startTranscription = () => {
    // Verificar si la API está disponible
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('⚠️ Web Speech API no disponible');
      setTranscription('Transcripción automática no disponible');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-CO'; // Español colombiano
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎙️ Transcripción iniciada');
      setIsListening(true);
      setIsTranscribing(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      if (fullTranscript.trim()) {
        console.log('🎤 Transcripción en tiempo real:', fullTranscript);
        setTranscription(fullTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Error en transcripción:', event.error);
      if (event.error === 'no-speech') {
        setTranscription('No se detectó voz...');
      } else if (event.error === 'not-allowed') {
        setTranscription('Permisos de micrófono denegados');
        setError('Permisos de micrófono denegados');
      } else {
        setTranscription(`Error de transcripción: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('🏁 Transcripción finalizada');
      setIsListening(false);
      setIsTranscribing(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('❌ Error iniciando transcripción:', error);
      setTranscription('Error iniciando transcripción');
    }
  };

  const stopTranscription = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsTranscribing(false);
      
      // Completar transcripción
      const finalTranscription = transcription.trim() || 'Transcripción automática no disponible';
      onTranscriptionComplete(finalTranscription);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const sendTranscription = () => {
    const finalTranscription = transcription.trim() || 'Transcripción automática no disponible';
    onTranscriptionComplete(finalTranscription);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Mic className="w-5 h-5 text-blue-500" />
          Grabación de Voz
        </h3>
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500">
            <motion.div
              className="w-3 h-3 bg-red-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Controles de grabación */}
      <div className="flex justify-center mb-4">
        <AnimatePresence mode="wait">
          {!isRecording ? (
            <motion.button
              key="start"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={startRecording}
              disabled={disabled}
              className="w-16 h-16 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <Mic className="w-8 h-8" />
            </motion.button>
          ) : (
            <motion.button
              key="stop"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={stopRecording}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <Square className="w-8 h-8" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Estado de transcripción */}
      {isTranscribing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <motion.div
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span className="text-sm">
              {isListening ? 'Escuchando y transcribiendo...' : 'Procesando transcripción...'}
            </span>
          </div>
        </div>
      )}

      {/* Transcripción */}
      {transcription && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Transcripción:
          </label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-slate-800 text-sm">{transcription}</p>
          </div>
        </div>
      )}

      {/* Controles de audio */}
      {audioUrl && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Audio grabado:</span>
            <button
              onClick={togglePlayback}
              className="flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm transition-colors"
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </button>
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="w-full"
            controls
          />
        </div>
      )}

      {/* Botón enviar */}
      {transcription && !isRecording && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={sendTranscription}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-lg"
        >
          <Send className="w-4 h-4" />
          Enviar Transcripción
        </motion.button>
      )}
    </div>
  );
} 