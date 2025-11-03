'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase/client';
import {
  Plus,
  Save,
  X,
  TrendingUp,
  Target,
  AlertTriangle,
  Calendar,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

interface CategoryData {
  id: string;
  name: string;
  amount: string;
  description: string;
  isEssential: boolean;
  type: 'income' | 'fixed_expense' | 'variable_expense';
}

export default function ManualBudgetPage() {
  const router = useRouter();
  // supabase ya está importado arriba
  
  const [budgetData, setBudgetData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    name: ''
  });
  
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setSaving] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<CategoryData>>({
    name: '',
    amount: '',
    description: '',
    isEssential: false
  });

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const addCategory = (type: 'income' | 'fixed_expense' | 'variable_expense') => {
    if (!newCategory.name?.trim() || !newCategory.amount?.trim()) {
      alert('Por favor completa el nombre y el monto');
      return;
    }

    const category: CategoryData = {
      id: Date.now().toString(),
      name: newCategory.name.trim(),
      amount: newCategory.amount,
      description: newCategory.description || '',
      isEssential: newCategory.isEssential || false,
      type
    };

    setCategories(prev => [...prev, category]);
    setNewCategory({ name: '', amount: '', description: '', isEssential: false });
    setShowCategoryForm(null);
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateCategory = (id: string, field: keyof CategoryData, value: any) => {
    setCategories(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const calculateTotals = () => {
    const income = categories
      .filter(c => c.type === 'income')
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    
    const fixedExpenses = categories
      .filter(c => c.type === 'fixed_expense')
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    
    const variableExpenses = categories
      .filter(c => c.type === 'variable_expense')
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    
    return {
      income,
      fixedExpenses,
      variableExpenses,
      balance: income - fixedExpenses - variableExpenses
    };
  };

  const saveBudget = async () => {
    try {
      setSaving(true);
      
      if (categories.length === 0) {
        alert('Agrega al menos una categoría al presupuesto');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Debes estar autenticado');
        return;
      }

      const totals = calculateTotals();
      
      // Crear presupuesto
      const { data: newBudget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          budget_month: budgetData.month,
          budget_year: budgetData.year,
          name: budgetData.name || `${monthNames[budgetData.month - 1]} ${budgetData.year}`,
          total_income: totals.income,
          total_fixed_expenses: totals.fixedExpenses,
          total_variable_expenses: totals.variableExpenses,
          status: 'active'
        })
        .select()
        .single();

      if (budgetError) {
        console.error('Error creando presupuesto:', budgetError);
        alert('Error creando el presupuesto');
        return;
      }

      // Crear categorías
      const categoriesToInsert = categories.map((category, index) => ({
        budget_id: newBudget.id,
        user_id: user.id,
        name: category.name,
        description: category.description || null,
        category_type: category.type,
        budgeted_amount: parseFloat(category.amount) || 0,
        actual_amount: 0,
        is_essential: category.isEssential,
        color_hex: getColorForCategory(category.type, index),
        sort_order: index + 1,
        is_active: true
      }));

      const { error: categoriesError } = await supabase
        .from('budget_categories')
        .insert(categoriesToInsert);

      if (categoriesError) {
        console.error('Error creando categorías:', categoriesError);
        alert('Error creando las categorías');
        return;
      }

      // Redirigir al presupuesto creado
      router.push(`/dashboard/budget/${newBudget.id}`);
      
    } catch (error) {
      console.error('Error guardando presupuesto:', error);
      alert('Error inesperado guardando el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  const getColorForCategory = (type: string, index: number): string => {
    const colorPalettes = {
      income: ['#10B981', '#059669', '#047857', '#065F46'],
      fixed_expense: ['#DC2626', '#EA580C', '#D97706', '#CA8A04'],
      variable_expense: ['#7C2D12', '#78350F', '#BE185D', '#A21CAF']
    };
    
    const palette = colorPalettes[type as keyof typeof colorPalettes] || colorPalettes.variable_expense;
    return palette[index % palette.length];
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/budget/create')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Crear Presupuesto Manual
              </h1>
              <p className="text-gray-600">
                Diseña tu presupuesto paso a paso
              </p>
            </div>
          </div>
          <button
            onClick={saveBudget}
            disabled={loading || categories.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando...' : 'Guardar Presupuesto'}</span>
          </button>
        </div>

        {/* Información del Presupuesto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Información del Presupuesto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes
              </label>
              <select
                value={budgetData.month}
                onChange={(e) => setBudgetData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {monthNames.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <input
                type="number"
                value={budgetData.year}
                onChange={(e) => setBudgetData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="2020"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre (opcional)
              </label>
              <input
                type="text"
                value={budgetData.name}
                onChange={(e) => setBudgetData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={`${monthNames[budgetData.month - 1]} ${budgetData.year}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Resumen de Totales */}
        {categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
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
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">G. Fijos</p>
                  <p className="text-xl font-bold text-red-600">
                    ${totals.fixedExpenses.toLocaleString()}
                  </p>
                </div>
                <Target className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">G. Variables</p>
                  <p className="text-xl font-bold text-yellow-600">
                    ${totals.variableExpenses.toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Balance</p>
                  <p className={`text-xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${totals.balance.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className={`w-8 h-8 ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Secciones de Categorías */}
        {['income', 'fixed_expense', 'variable_expense'].map((type) => {
          const typeConfig = {
            income: { 
              title: 'Ingresos', 
              icon: TrendingUp, 
              color: 'green',
              description: 'Salarios, ingresos adicionales, etc.'
            },
            fixed_expense: { 
              title: 'Gastos Fijos', 
              icon: Target, 
              color: 'red',
              description: 'Arriendos, servicios, seguros, etc.'
            },
            variable_expense: { 
              title: 'Gastos Variables', 
              icon: AlertTriangle, 
              color: 'yellow',
              description: 'Alimentación, entretenimiento, etc.'
            }
          };

          const config = typeConfig[type as keyof typeof typeConfig];
          const typeCategories = categories.filter(c => c.type === type);

          return (
            <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <config.icon className={`w-6 h-6 text-${config.color}-600`} />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {config.title} ({typeCategories.length})
                    </h2>
                    <p className="text-sm text-gray-500">{config.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCategoryForm(type)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm bg-${config.color}-50 text-${config.color}-600 rounded-lg hover:bg-${config.color}-100 transition-colors border border-${config.color}-300`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar {config.title.slice(0, -1)}</span>
                </button>
              </div>

              {/* Formulario para nueva categoría */}
              {showCategoryForm === type && (
                <div className={`mb-4 p-4 border border-${config.color}-300 rounded-lg bg-${config.color}-50`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={newCategory.name || ''}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre de la categoría"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={newCategory.amount || ''}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Monto mensual"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción (opcional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  />
                  {type === 'fixed_expense' && (
                    <label className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        checked={newCategory.isEssential || false}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, isEssential: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Marcar como esencial</span>
                    </label>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addCategory(type as any)}
                      className={`bg-${config.color}-600 text-white px-4 py-2 rounded-lg hover:bg-${config.color}-700 transition-colors`}
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setShowCategoryForm(null)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de categorías */}
              <div className="space-y-3">
                {typeCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                          className="font-medium text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none"
                        />
                        {category.isEssential && (
                          <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">
                            Esencial
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={category.amount}
                        onChange={(e) => updateCategory(category.id, 'amount', e.target.value)}
                        className="w-32 px-2 py-1 text-right font-bold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeCategory(category.id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {typeCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <config.icon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay {config.title.toLowerCase()} agregados</p>
                  <p className="text-sm">Haz click en "Agregar" para comenzar</p>
                </div>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Comienza a crear tu presupuesto
            </h3>
            <p className="text-gray-500 mb-6">
              Agrega categorías de ingresos y gastos para estructurar tu presupuesto mensual
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCategoryForm('income')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Ingreso</span>
              </button>
              <button
                onClick={() => setShowCategoryForm('fixed_expense')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Gasto Fijo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 