'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Send, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ 
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
  const recognitionRef = useRef<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      mediaRecorderRef.current.start(250); // Chunks cada 250ms
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

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError('');

    try {
      // Usar Web Speech API como fallback rápido
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        await transcribeWithWebSpeechAPI();
      } else {
        // Fallback: enviar a servidor para transcripción
        await transcribeWithServer(audioBlob);
      }
    } catch (error) {
      console.error('Error en transcripción:', error);
      setError('Error en la transcripción. Intenta de nuevo.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const transcribeWithWebSpeechAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar si la API está disponible
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        const placeholderText = "Transcripción automática no disponible";
        setTranscription(placeholderText);
        onTranscriptionComplete(placeholderText);
        resolve();
        return;
      }

      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-CO'; // Español colombiano
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎙️ Iniciando transcripción...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Transcripción obtenida:', transcript);
        setTranscription(transcript);
        onTranscriptionComplete(transcript);
        resolve();
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Error en Web Speech API:', event.error);
        const errorText = `Error de transcripción: ${event.error}`;
        setTranscription(errorText);
        onTranscriptionComplete(errorText);
        reject(new Error('Error en reconocimiento de voz'));
      };

      recognition.onend = () => {
        console.log('🏁 Transcripción finalizada');
        resolve();
      };

      // Iniciar reconocimiento de voz
      try {
        recognition.start();
      } catch (error) {
        console.error('❌ Error iniciando reconocimiento:', error);
        const placeholderText = "Error iniciando transcripción";
        setTranscription(placeholderText);
        onTranscriptionComplete(placeholderText);
        resolve();
      }
    });
  };

  const transcribeWithServer = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error en servidor de transcripción');
    }

    const result = await response.json();
    const transcript = result.transcription || 'No se pudo transcribir el audio';
    
    setTranscription(transcript);
    onTranscriptionComplete(transcript);
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
        console.log('🎤 Transcripción:', fullTranscript);
        setTranscription(fullTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Error en transcripción:', event.error);
      if (event.error === 'no-speech') {
        setTranscription('No se detectó voz...');
      } else if (event.error === 'not-allowed') {
        setTranscription('Permisos de micrófono denegados');
      } else {
        setTranscription(`Error de transcripción: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('🏁 Transcripción finalizada');
      setIsListening(false);
      setIsTranscribing(false);
      
      // Si la transcripción está vacía, usar texto por defecto
      if (!transcription.trim()) {
        const defaultText = 'Transcripción automática no disponible';
        setTranscription(defaultText);
        onTranscriptionComplete(defaultText);
      } else {
        onTranscriptionComplete(transcription);
      }
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

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendTranscription = () => {
    if (transcription.trim()) {
      onTranscriptionComplete(transcription);
      // Limpiar después de enviar
      setTranscription('');
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    }
  };

  return (
    <div className="voice-recorder">
      {/* Audio element para reproducción */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      )}

      <div className="flex items-center space-x-3">
        {/* Botón principal de grabación */}
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isTranscribing}
          className={`relative p-3 rounded-full transition-all duration-200 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileTap={{ scale: 0.95 }}
          animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
          transition={isRecording ? { repeat: Infinity, duration: 1 } : {}}
        >
          {isRecording ? (
            <Square className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}

          {/* Indicador visual de grabación */}
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-300"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.button>

        {/* Timer de grabación */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-red-500 font-mono text-sm"
            >
              {formatTime(recordingTime)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controles de audio grabado */}
        <AnimatePresence>
          {audioBlob && !isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2"
            >
              {/* Botón de reproducción */}
              <button
                onClick={playAudio}
                className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Botón de envío */}
              {transcription && (
                <button
                  onClick={sendTranscription}
                  className="p-2 text-green-600 hover:text-green-700 transition-colors"
                  title="Enviar transcripción"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Estado de transcripción */}
      <AnimatePresence>
        {isTranscribing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 text-sm text-blue-600"
          >
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Transcribiendo audio...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcripción */}
      <AnimatePresence>
        {transcription && !isTranscribing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <p className="text-sm text-slate-700 mb-2">Transcripción:</p>
            <p className="text-slate-900">{transcription}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 