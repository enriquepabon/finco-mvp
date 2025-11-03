'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../../../lib/supabase/client';
import {
  Copy,
  Save,
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit2
} from 'lucide-react';

interface Budget {
  id: string;
  name: string;
  budget_month: number;
  budget_year: number;
  total_income: number;
  total_fixed_expenses: number;
  total_variable_expenses: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  category_type: 'income' | 'fixed_expense' | 'variable_expense';
  budgeted_amount: number;
  is_essential: boolean;
  color_hex: string;
  icon_name?: string;
  sort_order: number;
}

export default function DuplicateBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const budgetId = params.budgetId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalBudget, setOriginalBudget] = useState<Budget | null>(null);
  const [originalCategories, setOriginalCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [newBudgetData, setNewBudgetData] = useState({
    name: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    loadOriginalBudget();
  }, [budgetId]);

  const loadOriginalBudget = async () => {
    try {
      setLoading(true);

      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

      if (budgetError || !budgetData) {
        console.log('Error cargando presupuesto:', budgetError);
        router.push('/budget/create');
        return;
      }

      setOriginalBudget(budgetData);
      setNewBudgetData({
        name: `${budgetData.name} (Copia)`,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budgetId)
        .eq('is_active', true)
        .order('sort_order');

      if (!categoriesError && categoriesData) {
        setOriginalCategories(categoriesData);
        setCategories(categoriesData.map((cat: any) => ({
          ...cat,
          id: Date.now().toString() + Math.random().toString()
        })));
      }

    } catch (error) {
      console.log('Error cargando datos:', error);
      router.push('/budget/create');
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = (categoryId: string, field: string, value: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, [field]: value }
        : cat
    ));
  };

  const removeCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const calculateTotals = () => {
    const income = categories
      .filter(cat => cat.category_type === 'income')
      .reduce((sum, cat) => sum + (cat.budgeted_amount || 0), 0);
    
    const fixedExpenses = categories
      .filter(cat => cat.category_type === 'fixed_expense')
      .reduce((sum, cat) => sum + (cat.budgeted_amount || 0), 0);
    
    const variableExpenses = categories
      .filter(cat => cat.category_type === 'variable_expense')
      .reduce((sum, cat) => sum + (cat.budgeted_amount || 0), 0);

    return {
      income,
      fixedExpenses,
      variableExpenses,
      balance: income - fixedExpenses - variableExpenses
    };
  };

  const duplicateBudget = async () => {
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Debes estar autenticado');
        return;
      }

      const totals = calculateTotals();
      
      const budgetData = {
        user_id: user.id,
        budget_month: newBudgetData.month,
        budget_year: newBudgetData.year,
        status: 'active',
        created_via_chat: false,
        chat_completed: false
      };

      console.log('📊 Datos del presupuesto a crear:', budgetData);
      console.log('👤 Usuario:', user.id);
      console.log('📋 Categorías a duplicar:', categories.length);
      console.log('🎯 Totales calculados:', totals);

      const { data: newBudget, error: budgetError } = await supabase
        .from('budgets')
        .insert(budgetData)
        .select()
        .single();

      if (budgetError) {
        console.log('❌ Error detallado al crear presupuesto:', budgetError);
        console.log('📋 Datos enviados:', budgetData);
        alert(`Error creando el presupuesto: ${budgetError.message || 'Error desconocido'}`);
        return;
      }

      console.log('✅ Presupuesto creado exitosamente:', newBudget.id);

      const categoriesToInsert = categories.map((category) => ({
        budget_id: newBudget.id,
        user_id: user.id,
        name: category.name,
        description: category.description || null,
        category_type: category.category_type,
        budgeted_amount: category.budgeted_amount || 0,
        actual_amount: 0,
        is_essential: category.is_essential || false,
        color_hex: category.color_hex || '#6B7280',
        icon_name: category.icon_name || 'Circle',
        sort_order: category.sort_order || 1,
        is_active: true
      }));

      console.log('📝 Categorías a insertar:', categoriesToInsert);

      const { error: categoriesError } = await supabase
        .from('budget_categories')
        .insert(categoriesToInsert);

      if (categoriesError) {
        console.log('❌ Error detallado al crear categorías:', categoriesError);
        console.log('📝 Categorías enviadas:', categoriesToInsert);
        alert(`Error creando las categorías: ${categoriesError.message || 'Error desconocido'}`);
        return;
      }

      router.push(`/dashboard/budget/${newBudget.id}`);
      
    } catch (error) {
      console.log('Error duplicando presupuesto:', error);
      alert('Error inesperado duplicando el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando presupuesto original...</p>
        </div>
      </div>
    );
  }

  if (!originalBudget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Presupuesto no encontrado</h2>
          <p className="text-gray-600 mb-4">No se pudo cargar el presupuesto original</p>
          <button
            onClick={() => router.push('/budget/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/budget/create')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Copy className="w-6 h-6 mr-2 text-blue-600" />
                Duplicar Presupuesto
              </h1>
              <p className="text-gray-600">
                Duplicando: {originalBudget.name} ({monthNames[originalBudget.budget_month - 1]} {originalBudget.budget_year})
              </p>
            </div>
          </div>
          <button
            onClick={duplicateBudget}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Duplicando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Duplicar Presupuesto</span>
              </>
            )}
          </button>
        </div>

        {/* Configuración del nuevo presupuesto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Configuración del Nuevo Presupuesto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Presupuesto
              </label>
              <input
                type="text"
                value={newBudgetData.name}
                onChange={(e) => setNewBudgetData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del presupuesto"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                value={newBudgetData.month}
                onChange={(e) => setNewBudgetData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <input
                type="number"
                value={newBudgetData.year}
                onChange={(e) => setNewBudgetData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                min="2024"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Resumen de totales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-xl font-bold text-green-600">
                  ${totals.income.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gastos Fijos</p>
                <p className="text-xl font-bold text-red-600">
                  ${totals.fixedExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gastos Variables</p>
                <p className="text-xl font-bold text-orange-600">
                  ${totals.variableExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance</p>
                <p className={`text-xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totals.balance.toLocaleString()}
                </p>
              </div>
              <DollarSign className={`w-8 h-8 ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Categorías por tipo */}
        {['income', 'fixed_expense', 'variable_expense'].map((categoryType) => {
          const categoryTitle = categoryType === 'income' ? 'Ingresos' : 
                               categoryType === 'fixed_expense' ? 'Gastos Fijos' : 'Gastos Variables';
          const categoryColor = categoryType === 'income' ? 'green' : 
                               categoryType === 'fixed_expense' ? 'red' : 'orange';
          const filteredCategories = categories.filter(cat => cat.category_type === categoryType);

          return (
            <div key={categoryType} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className={`text-lg font-semibold mb-4 text-${categoryColor}-600`}>
                {categoryTitle} ({filteredCategories.length})
              </h3>
              
              <div className="space-y-3">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre de la categoría"
                      />
                      
                      <input
                        type="number"
                        value={category.budgeted_amount}
                        onChange={(e) => updateCategory(category.id, 'budgeted_amount', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Monto"
                      />
                      
                      <input
                        type="text"
                        value={category.description || ''}
                        onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descripción (opcional)"
                      />
                    </div>
                    
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {filteredCategories.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No hay categorías de {categoryTitle.toLowerCase()} para duplicar
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 