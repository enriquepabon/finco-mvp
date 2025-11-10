'use client';

/**
 * Modal reutilizable para registrar transacciones manualmente
 * MentorIA - Sistema de Registro de Transacciones
 */

import { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, FileText, MapPin, StickyNote } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { CreateTransactionInput } from '@/types/transaction';

interface Budget {
  id: string;
  budget_month: number;
  budget_year: number;
}

interface Category {
  id: string;
  name: string;
  category_type: string;
  color_hex?: string;
}

interface Subcategory {
  id: string;
  name: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  budgetId?: string;
  preselectedCategory?: {
    id: string;
    name: string;
    type: string;
  };
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  budgetId,
  preselectedCategory
}: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // 🆕 Estados para subcategorías
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [showSubcategoryInput, setShowSubcategoryInput] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  
  const [formData, setFormData] = useState<CreateTransactionInput>({
    budget_id: budgetId || '',
    category_id: preselectedCategory?.id || '',
    description: '',
    detail: '', // 🆕 Campo detail
    amount: 0,
    transaction_type: preselectedCategory?.type === 'income' ? 'income' : 'expense',
    transaction_date: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (isOpen) {
      loadBudgets();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.budget_id) {
      loadCategories(formData.budget_id);
    }
  }, [formData.budget_id]);

  // 🆕 Cargar subcategorías cuando se selecciona una categoría
  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
      setShowSubcategoryInput(false);
    }
  }, [formData.category_id]);

  const loadBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('budgets')
        .select('id, budget_month, budget_year')
        .eq('user_id', user.id)
        .order('budget_year', { ascending: false })
        .order('budget_month', { ascending: false });

      if (!error && data) {
        setBudgets(data);
      }
    } catch (err) {
      console.error('Error loading budgets:', err);
    }
  };

  const loadCategories = async (budget_id: string) => {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('id, name, category_type, color_hex')
        .eq('budget_id', budget_id)
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // 🆕 Cargar subcategorías de una categoría
  const loadSubcategories = async (category_id: string) => {
    try {
      const { data, error } = await supabase
        .from('budget_subcategories')
        .select('id, name')
        .eq('category_id', category_id)
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setSubcategories(data);
        // Resetear subcategory_id si no está en la lista
        if (data.length > 0 && !data.find(s => s.id === formData.subcategory_id)) {
          setFormData(prev => ({ ...prev, subcategory_id: undefined }));
        }
      }
    } catch (err) {
      console.error('Error loading subcategories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.description.trim()) {
        throw new Error('La descripción es requerida');
      }

      if (formData.amount <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      if (!formData.budget_id) {
        throw new Error('Debes seleccionar un presupuesto');
      }

      // 🆕 Validar subcategoría si es requerida
      if (subcategories.length > 0 && !formData.subcategory_id && !newSubcategoryName.trim()) {
        throw new Error('Esta categoría requiere una subcategoría. Selecciona una o crea una nueva.');
      }

      // 🆕 Crear nueva subcategoría si el usuario ingresó una
      let subcategory_id = formData.subcategory_id;
      if (newSubcategoryName.trim() && formData.category_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        const { data: newSubcategory, error: subcategoryError } = await supabase
          .from('budget_subcategories')
          .insert({
            category_id: formData.category_id,
            budget_id: formData.budget_id,
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

        subcategory_id = newSubcategory.id;
        console.log('✅ New subcategory created:', subcategory_id);
      }

      // Crear transacción
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subcategory_id // 🆕 Incluir subcategory_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // 🆕 Manejar respuesta de subcategorías requeridas
        if (errorData.requires_subcategory && errorData.available_subcategories) {
          setSubcategories(errorData.available_subcategories);
          throw new Error(errorData.error);
        }
        
        throw new Error(errorData.error || 'Error al crear transacción');
      }

      console.log('✅ Transaction created successfully');
      
      // Resetear formulario
      setFormData({
        budget_id: budgetId || '',
        category_id: '',
        subcategory_id: undefined,
        description: '',
        amount: 0,
        transaction_type: 'expense',
        transaction_date: new Date().toISOString().split('T')[0],
        location: '',
        notes: ''
      });
      setNewSubcategoryName('');
      setShowSubcategoryInput(false);

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

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Registrar Transacción</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Tipo de Transacción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Transacción
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, transaction_type: 'income' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.transaction_type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Ingreso</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, transaction_type: 'expense' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.transaction_type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Gasto</span>
              </button>
            </div>
          </div>

          {/* Presupuesto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presupuesto <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.budget_id}
              onChange={(e) => setFormData({ ...formData, budget_id: e.target.value, category_id: '' })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona un presupuesto</option>
              {budgets.map((budget, index) => (
                <option key={budget.id || `budget-${index}`} value={budget.id}>
                  {monthNames[budget.budget_month - 1]} {budget.budget_year}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría (opcional)
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.budget_id}
            >
              <option value="">Sin categoría</option>
              {categories.map((category, index) => (
                <option key={category.id || `category-${index}`} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🆕 Subcategorías */}
          {subcategories.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <label className="block text-sm font-semibold text-blue-900 mb-3">
                📂 Subcategoría <span className="text-red-500">*</span>
              </label>
              
              {/* Lista de subcategorías */}
              <select
                value={formData.subcategory_id || ''}
                onChange={(e) => {
                  setFormData({ ...formData, subcategory_id: e.target.value || undefined });
                  if (e.target.value) {
                    setShowSubcategoryInput(false);
                    setNewSubcategoryName('');
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              >
                <option value="">Selecciona una subcategoría</option>
                {subcategories.map((sub, index) => (
                  <option key={sub.id || `subcategory-${index}`} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              {/* Opción para crear nueva subcategoría */}
              <div className="pt-3 border-t border-blue-200">
                <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSubcategoryInput}
                    onChange={(e) => {
                      setShowSubcategoryInput(e.target.checked);
                      if (e.target.checked) {
                        setFormData({ ...formData, subcategory_id: undefined });
                      } else {
                        setNewSubcategoryName('');
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">O crear una nueva subcategoría</span>
                </label>
                
                {showSubcategoryInput && (
                  <input
                    type="text"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Ej: Netflix, Spotify, Uber..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Descripción <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="ej: Compra en supermercado"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* 🆕 Detalle específico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Detalle específico <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.detail || ''}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              placeholder="ej: Préstamo de Juan - Cuota 1/3"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ayuda a identificar transacciones específicas en tu subcategoría
            </p>
          </div>

          {/* Monto y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Monto (COP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="100"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha
              </label>
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Ubicación (opcional)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="ej: Éxito Poblado"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <StickyNote className="w-4 h-4 inline mr-2" />
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </form>
      </div>
    </div>
  );
}

