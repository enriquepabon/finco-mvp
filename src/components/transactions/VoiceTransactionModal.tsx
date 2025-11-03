'use client';

/**
 * Modal para registrar transacciones por voz con IA
 * Usa Web Speech API + Google Gemini
 * FINCO - Sistema de Registro de Transacciones
 */

import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Save, Sparkles, AlertCircle, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { VoiceTransactionParsed } from '@/types/transaction';

interface VoiceTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  budgetId: string;
}

export default function VoiceTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  budgetId
}: VoiceTransactionModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<VoiceTransactionParsed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmNewCategory, setConfirmNewCategory] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Inicializar Web Speech API
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-CO';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Transcribed:', transcript);
        setTranscript(transcript);
        setIsRecording(false);
        
        // Auto-procesar con IA
        processWithAI(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        setError(`Error de reconocimiento: ${event.error}`);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    setError('');
    setTranscript('');
    setParsedData(null);
    setIsRecording(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Error al iniciar grabación');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const processWithAI = async (text: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/transactions/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          budget_id: budgetId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar voz');
      }

      const data = await response.json();
      setParsedData(data.parsed);
      
      // Si se necesita crear categoría, activar confirmación
      if (data.parsed.new_category_name && !data.parsed.suggested_category_id) {
        setConfirmNewCategory(true);
      }

    } catch (err) {
      console.error('Error processing voice:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!parsedData) return;

    setLoading(true);
    setError('');

    try {
      // Si necesita crear categoría y el usuario no confirmó
      if (parsedData.new_category_name && !parsedData.suggested_category_id && !confirmNewCategory) {
        setError('Debes confirmar la creación de la nueva categoría');
        setLoading(false);
        return;
      }

      let categoryId = parsedData.suggested_category_id;

      // Crear categoría si no existe y está confirmada
      if (!categoryId && parsedData.new_category_name && confirmNewCategory) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        const { data: newCategory, error: categoryError } = await supabase
          .from('budget_categories')
          .insert({
            budget_id: budgetId,
            user_id: user.id,
            name: parsedData.new_category_name,
            category_type: parsedData.new_category_type || 'variable_expense',
            budgeted_amount: 0,
            actual_amount: 0
          })
          .select()
          .single();

        if (categoryError) {
          throw new Error('Error al crear categoría: ' + categoryError.message);
        }

        categoryId = newCategory.id;
        console.log('✅ New category created:', categoryId);
      }

      // Crear transacción
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_id: budgetId,
          category_id: categoryId || null,
          description: parsedData.description,
          amount: parsedData.amount,
          transaction_type: parsedData.transaction_type,
          transaction_date: new Date().toISOString().split('T')[0],
          auto_categorized: true,
          confidence_score: parsedData.confidence
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear transacción');
      }

      console.log('✅ Voice transaction created successfully');
      
      // Reset
      setTranscript('');
      setParsedData(null);
      setConfirmNewCategory(false);

      if (onSuccess) onSuccess();
      onClose();

    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7" />
              <h2 className="text-2xl font-bold">Registro por Voz con IA</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-purple-100 mt-2 text-sm">
            Di algo como: "Compra en McDonald's por 50 mil pesos"
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Grabación */}
          <div className="text-center space-y-4">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-16 h-16 text-white" />
              ) : (
                <Mic className="w-16 h-16 text-white" />
              )}
            </button>

            <p className="text-lg font-medium text-gray-700">
              {isRecording ? 'Escuchando...' : 'Toca para grabar'}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">📝 Texto reconocido:</p>
              <p className="text-gray-900 font-medium">{transcript}</p>
            </div>
          )}

          {/* Loading IA */}
          {loading && !parsedData && (
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                <p className="text-purple-900 font-medium">Procesando con IA...</p>
              </div>
              <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full animate-progress" />
              </div>
            </div>
          )}

          {/* Datos parseados */}
          {parsedData && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 space-y-4">
              <div className="flex items-center gap-2 text-purple-900 font-semibold text-lg">
                <Sparkles className="w-5 h-5" />
                <span>Datos extraídos por IA</span>
                <span className="ml-auto text-sm bg-purple-200 px-3 py-1 rounded-full">
                  Confianza: {parsedData.confidence}%
                </span>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Descripción</p>
                  <p className="text-gray-900 font-medium">{parsedData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Monto</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${parsedData.amount.toLocaleString('es-CO')}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Tipo</p>
                    <p className={`text-lg font-semibold ${
                      parsedData.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parsedData.transaction_type === 'income' ? 'Ingreso' : 'Gasto'}
                    </p>
                  </div>
                </div>

                {/* Categoría */}
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Categoría</p>
                  {parsedData.suggested_category_id ? (
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      {parsedData.suggested_category_name}
                    </p>
                  ) : parsedData.new_category_name ? (
                    <div className="space-y-2">
                      <p className="text-amber-700 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Nueva categoría: "{parsedData.new_category_name}"
                      </p>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={confirmNewCategory}
                          onChange={(e) => setConfirmNewCategory(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-700">
                          Confirmo crear esta categoría nueva
                        </span>
                      </label>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Sin categoría</p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setParsedData(null);
                    setTranscript('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reintentar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || (parsedData.new_category_name && !parsedData.suggested_category_id && !confirmNewCategory)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Transacción
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

