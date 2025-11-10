'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Home,
  Zap,
  Smartphone,
  Car,
  ShoppingCart,
  Coffee,
  Heart,
  Plane,
  Book,
  Wallet,
  Sparkles,
  Calendar
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ElementType;
  amount: number;
  type: 'predefined' | 'custom';
}

interface BudgetStep {
  step: number;
  title: string;
  question: string;
  type: 'income' | 'fixed_expense' | 'variable_expense' | 'savings';
  predefinedCategories: { id: string; name: string; icon: React.ElementType }[];
}

const BUDGET_STEPS: BudgetStep[] = [
  {
    step: 1,
    title: 'Ingresos',
    question: '💰 ¿Cuáles son tus fuentes de ingreso mensual?',
    type: 'income',
    predefinedCategories: [
      { id: 'salary', name: 'Salario', icon: DollarSign },
      { id: 'freelance', name: 'Freelance', icon: Sparkles },
      { id: 'rental', name: 'Arriendos', icon: Home },
      { id: 'investments', name: 'Inversiones', icon: TrendingUp },
      { id: 'business', name: 'Negocio', icon: Wallet },
    ]
  },
  {
    step: 2,
    title: 'Gastos Fijos',
    question: '🏠 ¿Cuáles son tus gastos fijos mensuales? (Los que pagas sí o sí)',
    type: 'fixed_expense',
    predefinedCategories: [
      { id: 'rent', name: 'Arriendo', icon: Home },
      { id: 'utilities', name: 'Servicios', icon: Zap },
      { id: 'phone', name: 'Celular/Internet', icon: Smartphone },
      { id: 'insurance', name: 'Seguros', icon: Heart },
      { id: 'transport', name: 'Transporte', icon: Car },
      { id: 'subscriptions', name: 'Suscripciones', icon: Smartphone },
    ]
  },
  {
    step: 3,
    title: 'Gastos Variables',
    question: '🛒 ¿En qué gastas mes a mes? (Gastos que varían)',
    type: 'variable_expense',
    predefinedCategories: [
      { id: 'groceries', name: 'Mercado', icon: ShoppingCart },
      { id: 'restaurants', name: 'Restaurantes', icon: Coffee },
      { id: 'entertainment', name: 'Entretenimiento', icon: Plane },
      { id: 'clothing', name: 'Ropa', icon: ShoppingCart },
      { id: 'education', name: 'Educación', icon: Book },
      { id: 'health', name: 'Salud', icon: Heart },
    ]
  },
  {
    step: 4,
    title: 'Ahorros',
    question: '💎 ¿Cuánto planeas ahorrar mensualmente?',
    type: 'savings',
    predefinedCategories: [
      { id: 'emergency', name: 'Fondo de Emergencia', icon: Wallet },
      { id: 'goals', name: 'Metas Específicas', icon: TrendingUp },
      { id: 'investments', name: 'Inversiones', icon: Sparkles },
    ]
  }
];

interface InteractiveBudgetChatProps {
  onBack: () => void;
  onComplete?: (budgetData: any) => void;
  className?: string;
}

export default function InteractiveBudgetChat({
  onBack,
  onComplete,
  className = ''
}: InteractiveBudgetChatProps) {
  const router = useRouter();
  // Paso -1: Selector de mes/año, luego paso 0-3 para las categorías
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategories, setSelectedCategories] = useState<Record<number, CategoryItem[]>>({});
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const YEARS = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i);

  const currentStepData = currentStep >= 0 ? BUDGET_STEPS[currentStep] : null;
  const currentSelections = currentStep >= 0 ? (selectedCategories[currentStep] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep, currentSelections]);

  const handleSelectCategory = (category: { id: string; name: string; icon: React.ElementType }) => {
    const existing = currentSelections.find(c => c.id === category.id);
    if (existing) {
      // Deseleccionar
      setSelectedCategories({
        ...selectedCategories,
        [currentStep]: currentSelections.filter(c => c.id !== category.id)
      });
    } else {
      // Seleccionar
      setSelectedCategories({
        ...selectedCategories,
        [currentStep]: [
          ...currentSelections,
          {
            id: category.id,
            name: category.name,
            icon: category.icon,
            amount: 0,
            type: 'predefined'
          }
        ]
      });
    }
  };

  const handleAddCustomCategory = () => {
    if (!customCategoryName.trim()) return;

    const customId = `custom_${Date.now()}`;
    setSelectedCategories({
      ...selectedCategories,
      [currentStep]: [
        ...currentSelections,
        {
          id: customId,
          name: customCategoryName,
          icon: DollarSign,
          amount: 0,
          type: 'custom'
        }
      ]
    });
    setCustomCategoryName('');
    setShowCustomInput(false);
  };

  const handleUpdateAmount = (categoryId: string, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setSelectedCategories({
      ...selectedCategories,
      [currentStep]: currentSelections.map(cat =>
        cat.id === categoryId ? { ...cat, amount: numValue } : cat
      )
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories({
      ...selectedCategories,
      [currentStep]: currentSelections.filter(c => c.id !== categoryId)
    });
  };

  const handleNext = () => {
    if (currentStep === -1) {
      // Del selector de mes al primer paso de categorías
      setCurrentStep(0);
    } else if (currentStep < BUDGET_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitBudget();
    }
  };

  const handleBack = () => {
    if (currentStep > -1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canContinue = () => {
    // En el selector de mes/año, siempre puede continuar
    if (currentStep === -1) {
      return true;
    }
    // Para ahorros, permitir continuar sin selección
    if (currentStepData && currentStepData.type === 'savings') {
      return true;
    }
    // Para otros pasos, requerir al menos una categoría con monto
    return currentSelections.length > 0 && currentSelections.some(cat => cat.amount > 0);
  };

  const handleSubmitBudget = async () => {
    setIsSubmitting(true);

    // Construir JSON con todos los datos recopilados
    const budgetJSON = {
      month: selectedMonth,
      year: selectedYear,
      ingresos: (selectedCategories[0] || []).map(cat => ({
        nombre: cat.name,
        monto: cat.amount
      })),
      gastos_fijos: (selectedCategories[1] || []).map(cat => ({
        nombre: cat.name,
        monto: cat.amount
      })),
      gastos_variables: (selectedCategories[2] || []).map(cat => ({
        nombre: cat.name,
        monto: cat.amount
      })),
      ahorros: (selectedCategories[3] || []).map(cat => ({
        nombre: cat.name,
        monto: cat.amount
      }))
    };

    console.log('📊 Budget JSON generado:', budgetJSON);

    try {
      // Obtener el token del usuario
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No hay sesión activa');
      }

      // Llamar al API para crear el presupuesto
      const response = await fetch('/api/budget/create-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ budgetData: budgetJSON })
      });

      const data = await response.json();

      if (!response.ok) {
        setIsSubmitting(false);
        
        // Si ya existe un presupuesto para este período (409)
        if (response.status === 409 && data.existingBudgetId) {
          const shouldNavigate = window.confirm(
            data.message || 'Ya existe un presupuesto para este período. ¿Deseas ir a verlo?'
          );
          
          if (shouldNavigate) {
            router.push(`/dashboard/budget/${data.existingBudgetId}`);
            onComplete?.({ id: data.existingBudgetId });
          }
          // No lanzar error, solo retornar
          return;
        }
        
        // Para otros errores, sí mostrar alerta
        alert(data.error || 'Error al crear el presupuesto. Por favor, inténtalo de nuevo.');
        return;
      }

      console.log('✅ Presupuesto creado:', data.budget);
      
      setIsSubmitting(false);
      
      // Redirigir al presupuesto creado
      if (data.budget?.id) {
        router.push(`/dashboard/budget/${data.budget.id}`);
      }
      
      onComplete?.(data.budget);
    } catch (error) {
      console.error('❌ Error creando presupuesto:', error);
      setIsSubmitting(false);
      alert('Error al crear el presupuesto. Por favor, inténtalo de nuevo.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTotalForStep = (step: number) => {
    const cats = selectedCategories[step] || [];
    return cats.reduce((sum, cat) => sum + cat.amount, 0);
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </button>

        <h2 className="text-lg font-semibold text-slate-800">
          {currentStep === -1 ? 'Seleccionar Período' : 'Crear Presupuesto'}
        </h2>

        <div className="text-sm text-slate-500">
          {currentStep === -1 ? 'Paso 1/5' : `Paso ${currentStep + 2}/5`}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 2) / 5) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="wait">
          {currentStep === -1 ? (
            // Selector de Mes y Año
            <motion.div
              key="month-year-selector"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Question */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      ¿Para qué mes deseas crear tu presupuesto?
                    </h3>
                    <p className="text-slate-600">
                      Selecciona el mes y año para el que quieres planificar tus finanzas
                    </p>
                  </div>
                </div>
              </div>

              {/* Month Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Mes:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((month, index) => (
                    <motion.button
                      key={month}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMonth(index + 1)}
                      className={`
                        px-4 py-3 rounded-xl font-medium transition-all
                        ${selectedMonth === index + 1
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                          : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300'
                        }
                      `}
                    >
                      {month}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Year Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Año:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {YEARS.map((year) => (
                    <motion.button
                      key={year}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedYear(year)}
                      className={`
                        px-4 py-3 rounded-xl font-medium transition-all
                        ${selectedYear === year
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                          : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300'
                        }
                      `}
                    >
                      {year}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Selected Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">
                    Presupuesto seleccionado para:
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {MONTHS[selectedMonth - 1]} {selectedYear}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            // Pasos de categorías (existente)
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Question */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {currentStepData.title}
                  </h3>
                  <p className="text-slate-600">
                    {currentStepData.question}
                  </p>
                </div>
              </div>
            </div>

            {/* Predefined Categories (Chips) */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">
                Selecciona las que apliquen:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentStepData.predefinedCategories.map((category) => {
                  const isSelected = currentSelections.some(c => c.id === category.id);
                  const Icon = category.icon;
                  
                  return (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectCategory(category)}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all
                        ${isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                          : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                      {isSelected && <Check className="w-4 h-4" />}
                    </motion.button>
                  );
                })}

                {/* Add Custom Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-slate-100 text-slate-700 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Agregar otro
                </motion.button>
              </div>
            </div>

            {/* Custom Category Input */}
            <AnimatePresence>
              {showCustomInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-200"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                      placeholder="Nombre de la categoría..."
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={handleAddCustomCategory}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomCategoryName('');
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Categories with Amount Inputs */}
            {currentSelections.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  Ingresa los montos mensuales:
                </p>
                <div className="space-y-2">
                  {currentSelections.map((category, index) => {
                    const Icon = category.icon;
                    // Asegurar que siempre haya una key única
                    const uniqueKey = category.id || `category-${currentStep}-${index}`;
                    return (
                      <motion.div
                        key={uniqueKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {category.name}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                              $
                            </span>
                            <input
                              type="text"
                              value={category.amount || ''}
                              onChange={(e) => handleUpdateAmount(category.id, e.target.value)}
                              placeholder="0"
                              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveCategory(category.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Total for current step */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Total {currentStepData.title}:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(getTotalForStep(currentStep))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-3">
          {currentStep > -1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Anterior
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canContinue() || isSubmitting}
            className={`
              flex-1 px-6 py-3 rounded-xl font-medium transition-all
              ${canContinue() && !isSubmitting
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creando presupuesto...
              </span>
            ) : currentStep === -1 ? (
              'Comenzar'
            ) : currentStep === BUDGET_STEPS.length - 1 ? (
              'Crear Presupuesto'
            ) : (
              'Continuar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

