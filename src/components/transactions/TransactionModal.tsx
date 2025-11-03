'use client';

/**
 * Modal reutilizable para registrar transacciones manualmente
 * FINCO - Sistema de Registro de Transacciones
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
  
  const [formData, setFormData] = useState<CreateTransactionInput>({
    budget_id: budgetId || '',
    category_id: preselectedCategory?.id || '',
    description: '',
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

      // Crear transacción
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear transacción');
      }

      console.log('✅ Transaction created successfully');
      
      // Resetear formulario
      setFormData({
        budget_id: budgetId || '',
        category_id: '',
        description: '',
        amount: 0,
        transaction_type: 'expense',
        transaction_date: new Date().toISOString().split('T')[0],
        location: '',
        notes: ''
      });

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
              {budgets.map(budget => (
                <option key={budget.id} value={budget.id}>
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
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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

