'use client';

/**
 * Modal para registrar transacciones por voz con IA
 * Usa Web Speech API + Google Gemini
 * MentorIA - Sistema de Registro de Transacciones
 */

import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Save, Sparkles, AlertCircle, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { VoiceTransactionParsed } from '@/types/transaction';

// Web Speech API type definitions
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

interface WindowWithSpeechRecognition {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

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
  
  // 🆕 Estados para edición de categorías y subcategorías
  const [availableCategories, setAvailableCategories] = useState<Array<{
    id: string;
    name: string;
    category_type: string;
    expense_type?: string | null;
    is_essential?: boolean | null;
    subcategories: Array<{id: string; name: string}>;
  }>>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<Array<{id: string; name: string}>>([]);
  const [showSubcategorySelector, setShowSubcategorySelector] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewSubcategoryInput, setShowNewSubcategoryInput] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 🆕 Cargar categorías y subcategorías al abrir el modal
  useEffect(() => {
    if (isOpen && budgetId) {
      loadCategoriesAndSubcategories();
    }
  }, [isOpen, budgetId]);

  const loadCategoriesAndSubcategories = async () => {
    try {
      const { data: categories, error } = await supabase
        .from('budget_categories')
        .select(`
          id,
          name,
          category_type,
          expense_type,
          is_essential,
          budget_subcategories (
            id,
            name
          )
        `)
        .eq('budget_id', budgetId)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      if (categories) {
        const formatted = categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          category_type: cat.category_type,
          expense_type: cat.expense_type,
          is_essential: cat.is_essential,
          subcategories: cat.budget_subcategories?.map((sub: any) => ({
            id: sub.id,
            name: sub.name
          })) || []
        }));
        
        setAvailableCategories(formatted);
        console.log('✅ Categorías cargadas:', formatted);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    // Inicializar Web Speech API
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as WindowWithSpeechRecognition).webkitSpeechRecognition || (window as WindowWithSpeechRecognition).SpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'es-CO';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          console.log('🎤 Transcribed:', transcript);
          setTranscript(transcript);
          setIsRecording(false);

          // Auto-procesar con IA
          processWithAI(transcript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('❌ Speech recognition error:', event.error);
          
          let errorMessage = `Error de reconocimiento: ${event.error}`;
          
          if (event.error === 'not-allowed') {
            errorMessage = '🎤 Permisos de micrófono denegados. Por favor:\n\n1. Click en el ícono 🔒 o ⓘ en la barra de dirección\n2. Permite el acceso al micrófono\n3. Recarga la página e intenta de nuevo';
          } else if (event.error === 'no-speech') {
            errorMessage = '🔇 No se detectó voz. Habla más cerca del micrófono e intenta de nuevo.';
          } else if (event.error === 'audio-capture') {
            errorMessage = '🎙️ No se puede acceder al micrófono. Verifica que esté conectado y funcione correctamente.';
          } else if (event.error === 'network') {
            errorMessage = '📡 Error de conexión. Verifica tu internet e intenta de nuevo.';
          } else if (event.error === 'service-not-allowed') {
            errorMessage = '⚠️ Servicio de reconocimiento de voz no disponible. Intenta usar otro navegador (Chrome o Edge recomendados).';
          }
          
          setError(errorMessage);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
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
      // Primero intentar acceder al micrófono explícitamente con getUserMedia
      // Esto fuerza al navegador a mostrar el prompt de permisos
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          // Detener el stream inmediatamente, solo lo necesitábamos para solicitar permisos
          stream.getTracks().forEach(track => track.stop());
          
          // Ahora sí iniciar el reconocimiento de voz
          console.log('✅ Permisos de micrófono concedidos, iniciando reconocimiento...');
          recognitionRef.current?.start();
        })
        .catch((err) => {
          console.error('❌ Error solicitando permisos de micrófono:', err);
          setIsRecording(false);
          
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('🎤 Permisos de micrófono denegados.\n\nPasos para solucionarlo:\n\n1. Recarga la página completamente (F5 o Ctrl+R)\n2. Cuando aparezca el popup, selecciona "Permitir"\n3. Si no aparece popup, revisa el ícono 🔒 en la barra de dirección\n4. En "Permisos del sitio" → Micrófono → Permitir\n5. Recarga la página de nuevo');
          } else if (err.name === 'NotFoundError') {
            setError('🎙️ No se detectó ningún micrófono. Verifica que esté conectado correctamente.');
          } else {
            setError(`❌ Error: ${err.message}`);
          }
        });
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
      // Obtener token de autenticación
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No autenticado');
      }

      // Llamar al nuevo endpoint de análisis con IA
      const response = await fetch('/api/transactions/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar voz');
      }

      const data = await response.json();
      console.log('✅ Transacción analizada por IA:', data);

      // 🆕 El backend ya devolvió category_id y subcategory_id
      const analyzed = data.transaction;
      
      // Si el backend mapeó exitosamente, usar esos IDs
      if (analyzed.category_id && analyzed.subcategory_id) {
        console.log('✅ Backend mapeó correctamente:', {
          category_id: analyzed.category_id,
          subcategory_id: analyzed.subcategory_id
        });

        // 🆕 Configurar estados de selección
        setSelectedCategoryId(analyzed.category_id);
        setSelectedSubcategoryId(analyzed.subcategory_id);
        
        // Cargar subcategorías de la categoría seleccionada
        console.log('🔍 Buscando categoría en availableCategories:', {
          buscando: analyzed.category_id,
          total_disponibles: availableCategories.length,
          categorias: availableCategories.map(c => ({ id: c.id, name: c.name, subcats: c.subcategories?.length || 0 }))
        });
        
        const selectedCategory = availableCategories.find(cat => cat.id === analyzed.category_id);
        if (selectedCategory && selectedCategory.subcategories) {
          setAvailableSubcategories(selectedCategory.subcategories);
          console.log('✅ Subcategorías cargadas para dropdown:', selectedCategory.subcategories);
        } else {
          console.warn('⚠️ No se encontró la categoría o no tiene subcategorías:', {
            found: !!selectedCategory,
            has_subcats: selectedCategory?.subcategories?.length || 0
          });
          setAvailableSubcategories([]);
        }

        setParsedData({
          amount: analyzed.amount === -1 ? 0 : analyzed.amount, // 🆕 Si no hay monto, iniciar en 0
          description: analyzed.description,
          detail: analyzed.detail,
          transaction_type: analyzed.transaction_type,
          suggested_category_id: analyzed.category_id,
          suggested_subcategory_id: analyzed.subcategory_id,
          suggested_category_name: analyzed.suggested_category_name || '',
          suggested_subcategory_name: analyzed.suggested_subcategory_name || '',
          new_category_name: null,
          new_category_type: analyzed.category,
          confidence: 95
        });
        
        // 🆕 Si no hay monto, mostrar mensaje al usuario
        if (analyzed.amount === -1) {
          setError('⚠️ No detecté un monto en tu mensaje. Por favor, ingrésalo manualmente.');
        }
      } else {
        // No se pudo mapear → Solicitar confirmación al usuario
        console.log('⚠️ No se encontró categoría existente, requiere confirmación del usuario');
        
        setError(`No encontré "${analyzed.suggested_subcategory_name}" en tu presupuesto. ¿Deseas crearla o elegir otra?`);
        
        // Cargar todas las categorías y subcategorías disponibles
        const { data: allCategories } = await supabase
          .from('budget_categories')
          .select(`
            id,
            name,
            category_type,
            budget_subcategories (
              id,
              name
            )
          `)
          .eq('budget_id', budgetId)
          .eq('is_active', true);

        if (allCategories) {
          // Preparar para mostrar opciones al usuario
          const categoriesWithSubs = allCategories.filter(cat => 
            cat.budget_subcategories && cat.budget_subcategories.length > 0
          );
          
          console.log('📂 Categorías disponibles para selección:', categoriesWithSubs);
        }

        setParsedData({
          amount: analyzed.amount,
          description: analyzed.description,
          transaction_type: analyzed.transaction_type,
          suggested_category_id: null,
          suggested_subcategory_id: null,
          suggested_category_name: analyzed.suggested_category_name || '',
          suggested_subcategory_name: analyzed.suggested_subcategory_name || '',
          new_category_name: analyzed.suggested_subcategory_name,
          new_category_type: analyzed.category,
          expense_type: analyzed.expense_type,
          is_essential: analyzed.is_essential,
          confidence: 95,
          requires_user_confirmation: true // 🆕 Flag para mostrar UI de confirmación
        });
        
        // 🆕 Pre-llenar campos de nueva categoría y subcategoría con sugerencias de IA
        setShowNewCategoryInput(true);
        setNewCategoryName(analyzed.suggested_category_name || '');
        setNewSubcategoryName(analyzed.suggested_subcategory_name || '');
        setShowNewSubcategoryInput(true);
        
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

    // 🆕 Validar que el monto sea mayor que 0
    if (!parsedData.amount || parsedData.amount <= 0) {
      setError('⚠️ Debes ingresar un monto válido mayor que 0');
      return;
    }

    // 🆕 Validar que budgetId existe
    if (!budgetId || budgetId === '') {
      setError('❌ Error: No se encontró el presupuesto. Por favor, cierra y vuelve a abrir el modal.');
      console.error('❌ budgetId vacío:', budgetId);
      return;
    }

    console.log('✅ budgetId válido:', budgetId);

    setLoading(true);
    setError('');

    try {
      // 🆕 Usar category_id seleccionado por el usuario o crear nueva
      let categoryId = selectedCategoryId;

      // Crear nueva categoría si el usuario eligió esa opción
      if (showNewCategoryInput && newCategoryName.trim()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        console.log('🆕 Intentando crear categoría:', newCategoryName.trim(), 'para budgetId:', budgetId);

        // Verificar si ya existe una categoría con ese nombre en este presupuesto
        const { data: existingCategory } = await supabase
          .from('budget_categories')
          .select('id')
          .eq('budget_id', budgetId)
          .eq('name', newCategoryName.trim())
          .maybeSingle();

        if (existingCategory) {
          // Si ya existe, usar esa categoría
          categoryId = existingCategory.id;
          console.log('✅ Categoría existente encontrada:', categoryId);
        } else {
          // Si no existe, crear nueva
          // Determinar category_type, expense_type, is_essential según el tipo de transacción
          let categoryType: 'income' | 'expense' | 'savings' = 'expense';
          let expenseType: 'fixed' | 'variable' | null = null;
          let isEssential: boolean | null = null;

          if (parsedData.transaction_type === 'income') {
            categoryType = 'income';
          } else if (parsedData.new_category_type === 'savings') {
            categoryType = 'savings';
          } else {
            categoryType = 'expense';
            expenseType = parsedData.expense_type || 'variable';
            isEssential = parsedData.is_essential ?? false;
          }

          console.log('📝 Datos para crear categoría:', {
            budget_id: budgetId,
            user_id: user.id,
            name: newCategoryName.trim(),
            category_type: categoryType,
            expense_type: expenseType,
            is_essential: isEssential
          });

          const { data: newCategory, error: categoryError } = await supabase
            .from('budget_categories')
            .insert({
              budget_id: budgetId,
              user_id: user.id,
              name: newCategoryName.trim(),
              category_type: categoryType,
              expense_type: expenseType,
              is_essential: isEssential,
              budgeted_amount: 0,
              actual_amount: 0,
              is_active: true
            })
            .select()
            .single();

          if (categoryError) {
            console.error('❌ Error creating category:', categoryError);
            throw new Error('Error al crear categoría: ' + categoryError.message);
          }

          categoryId = newCategory.id;
          console.log('✅ Nueva categoría creada:', categoryId);
        }
      }

      // Validar que se haya seleccionado una categoría
      if (!categoryId) {
        setError('Debes seleccionar una categoría');
        setLoading(false);
        return;
      }

      // 🆕 Usar subcategory_id seleccionado por el usuario o crear nueva
      let subcategoryId = selectedSubcategoryId;
      
      // Crear nueva subcategoría si el usuario eligió esa opción
      if (showNewSubcategoryInput && newSubcategoryName.trim() && categoryId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        // Verificar si ya existe una subcategoría con ese nombre en esta categoría
        const { data: existingSubcategory } = await supabase
          .from('budget_subcategories')
          .select('id')
          .eq('category_id', categoryId)
          .eq('name', newSubcategoryName.trim())
          .maybeSingle();

        if (existingSubcategory) {
          // Si ya existe, usar esa subcategoría
          subcategoryId = existingSubcategory.id;
          console.log('✅ Subcategoría existente encontrada:', subcategoryId);
        } else {
          // Si no existe, crear nueva
          const { data: newSubcategory, error: subcategoryError } = await supabase
            .from('budget_subcategories')
            .insert({
              category_id: categoryId,
              budget_id: budgetId,
              user_id: user.id,
              name: newSubcategoryName.trim(),
              budgeted_amount: 0,
              actual_amount: 0
            })
            .select()
            .single();

          if (subcategoryError) {
            throw new Error('Error al crear subcategoría: ' + subcategoryError.message);
          }

          subcategoryId = newSubcategory.id;
          console.log('✅ Nueva subcategoría creada:', subcategoryId);
        }
      }

      // Validar que se haya seleccionado una subcategoría
      if (!subcategoryId) {
        setError('Debes seleccionar una subcategoría');
        setLoading(false);
        return;
      }
      
      console.log('📝 Guardando transacción con:', {
        budget_id: budgetId,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        user_selected: true
      });

      // Crear transacción
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_id: budgetId,
          category_id: categoryId || null,
          subcategory_id: subcategoryId || null, // 🆕 Incluir subcategory_id
          description: parsedData.description,
          detail: parsedData.detail || null, // 🆕 Incluir detail
          amount: parsedData.amount,
          transaction_type: parsedData.transaction_type,
          transaction_date: new Date().toISOString().split('T')[0],
          auto_categorized: true,
          confidence_score: parsedData.confidence
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // 🆕 Manejar respuesta de subcategorías requeridas
        if (errorData.requires_subcategory && errorData.available_subcategories) {
          setAvailableSubcategories(errorData.available_subcategories);
          setShowSubcategorySelector(true);
          throw new Error(errorData.error);
        }
        
        throw new Error(errorData.error || 'Error al crear transacción');
      }

      console.log('✅ Voice transaction created successfully');
      
      // Reset todos los estados
      setTranscript('');
      setParsedData(null);
      setConfirmNewCategory(false);
      setAvailableSubcategories([]);
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
      setShowSubcategorySelector(false);
      setNewCategoryName('');
      setNewSubcategoryName('');
      setShowNewCategoryInput(false);
      setShowNewSubcategoryInput(false);

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

              {/* Preview Editable */}
              <div className="space-y-3">
                {/* Descripción editable */}
                <div className="bg-white rounded-lg p-4">
                  <label className="text-sm text-gray-500 mb-2 block">Descripción</label>
                  <input
                    type="text"
                    value={parsedData.description}
                    onChange={(e) => setParsedData({ ...parsedData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* 🆕 Detalle editable */}
                <div className="bg-white rounded-lg p-4">
                  <label className="text-sm text-gray-500 mb-2 block">
                    Detalle específico <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={parsedData.detail || ''}
                    onChange={(e) => setParsedData({ ...parsedData, detail: e.target.value })}
                    placeholder="Ej: Préstamo de Juan - Cuota 1/3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Este campo te ayuda a identificar transacciones específicas dentro de una misma subcategoría
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Monto</p>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xl">$</span>
                      <input
                        type="number"
                        value={parsedData.amount}
                        onChange={(e) => {
                          const newAmount = parseFloat(e.target.value) || 0;
                          setParsedData({ ...parsedData, amount: newAmount });
                          // Limpiar error si había monto faltante
                          if (error && error.includes('No detecté un monto')) {
                            setError('');
                          }
                        }}
                        placeholder="0"
                        className="w-full text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
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

                {/* 🆕 Categoría editable con dropdown */}
                <div className="bg-white rounded-lg p-4">
                  <label className="text-sm text-gray-500 mb-2 block">
                    <span>Categoría</span>
                    {parsedData.suggested_category_name && (
                      <span className="ml-2 text-purple-600 text-xs">
                        ✨ Sugerencia IA: {parsedData.suggested_category_name}
                      </span>
                    )}
                  </label>
                  {!showNewCategoryInput ? (
                    <select
                      key="category-select"
                      value={selectedCategoryId || ''}
                      onChange={(e) => {
                        const newCategoryId = e.target.value;
                        if (newCategoryId === 'NEW') {
                          setShowNewCategoryInput(true);
                          setSelectedCategoryId(null);
                          setSelectedSubcategoryId(null);
                          setAvailableSubcategories([]);
                          setNewCategoryName(parsedData.suggested_category_name || '');
                        } else {
                          setShowNewCategoryInput(false);
                          setSelectedCategoryId(newCategoryId);
                          setSelectedSubcategoryId(null);
                          
                          // Cargar subcategorías de la categoría seleccionada
                          const selectedCategory = availableCategories.find(cat => cat.id === newCategoryId);
                          if (selectedCategory) {
                            setAvailableSubcategories(selectedCategory.subcategories);
                            console.log('📂 Subcategorías disponibles:', selectedCategory.subcategories);
                          } else {
                            setAvailableSubcategories([]);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Selecciona una categoría</option>
                    {parsedData.transaction_type === 'income' && (
                      <optgroup key="income-group" label="💰 Ingresos">
                        {availableCategories
                          .filter(cat => cat.category_type === 'income')
                          .map((cat, index) => (
                            <option key={cat.id || `income-cat-${index}`} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    {parsedData.transaction_type === 'expense' && (
                      <>
                        <optgroup key="fixed-expenses" label="🏠 Gastos Fijos">
                          {availableCategories
                            .filter(cat => cat.category_type === 'expense' && cat.expense_type === 'fixed')
                            .map((cat, index) => (
                              <option key={cat.id || `fixed-cat-${index}`} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup key="variable-expenses" label="🛒 Gastos Variables">
                          {availableCategories
                            .filter(cat => cat.category_type === 'expense' && cat.expense_type === 'variable')
                            .map((cat, index) => (
                              <option key={cat.id || `variable-cat-${index}`} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup key="savings-expenses" label="🏦 Ahorros">
                          {availableCategories
                            .filter(cat => cat.category_type === 'savings')
                            .map((cat, index) => (
                              <option key={cat.id || `savings-cat-${index}`} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                        </optgroup>
                      </>
                    )}
                    <option value="NEW">➕ Crear nueva categoría</option>
                  </select>
                  ) : (
                    /* Input para crear nueva categoría */
                    <div key="category-input" className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-purple-900 font-medium">Nueva categoría:</p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategoryInput(false);
                            setNewCategoryName('');
                            setShowNewSubcategoryInput(false);
                            setNewSubcategoryName('');
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ej: Servicios, Transporte, etc."
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* 🆕 Subcategoría editable con dropdown */}
                {(selectedCategoryId || showNewCategoryInput) && (
                  <div className="bg-white rounded-lg p-4">
                    <label className="text-sm text-gray-500 mb-2 block">
                      <span>Subcategoría</span>
                      {parsedData.suggested_subcategory_name && (
                        <span className="ml-2 text-purple-600 text-xs">
                          ✨ Sugerencia IA: {parsedData.suggested_subcategory_name}
                        </span>
                      )}
                    </label>
                    {!showNewSubcategoryInput ? (
                      <select
                        key="subcategory-select"
                        value={selectedSubcategoryId || ''}
                        onChange={(e) => {
                          const newSubcategoryId = e.target.value;
                          if (newSubcategoryId === 'NEW') {
                            setShowNewSubcategoryInput(true);
                            setSelectedSubcategoryId(null);
                            setNewSubcategoryName(parsedData.suggested_subcategory_name || '');
                          } else {
                            setShowNewSubcategoryInput(false);
                            setSelectedSubcategoryId(newSubcategoryId);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Selecciona una subcategoría</option>
                        {availableSubcategories.map((sub, index) => (
                          <option key={sub.id || `subcat-${index}`} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                        <option value="NEW">➕ Crear nueva subcategoría</option>
                      </select>
                    ) : (
                      /* Input para crear nueva subcategoría */
                      <div key="subcategory-input" className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-purple-900 font-medium">Nueva subcategoría:</p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewSubcategoryInput(false);
                              setNewSubcategoryName('');
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                        <input
                          type="text"
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          placeholder="Ej: Agua, Luz, Gas, etc."
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                )}
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
                  disabled={loading || !!(parsedData.new_category_name && !parsedData.suggested_category_id && !confirmNewCategory)}
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

