// ============================================================================
// DASHBOARD DE PRESUPUESTO ELEGANTE - MentorIA
// Versión: 3.0.0
// Fecha: Enero 2025
// Descripción: Dashboard con diseño de tabla elegante y distribución en columnas
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, 
  Calendar, 
  Edit3, 
  Save,
  X,
  Plus,
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  PiggyBank,
  Zap,
  HelpCircle
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import TransactionModal from '@/components/transactions/TransactionModal';
import TransactionListModal from '@/components/transactions/TransactionListModal';
import FinancialReportModal from '@/components/reports/FinancialReportModal';
import CashbeatFloatingButton from '@/components/ui/CashbeatFloatingButton';
import AdvancedChatModal from '@/components/chat/AdvancedChatModal';
import { useTour } from '@/hooks/useTour';

// Interfaces
interface Budget {
  id: string;
  budget_month: number;
  budget_year: number;
  total_income: number;
  total_fixed_expenses: number;
  total_variable_expenses: number;
  total_savings: number;
  actual_income: number;
  actual_fixed_expenses: number;
  actual_variable_expenses: number;
  status: string;
  chat_completed: boolean;
}

interface BudgetCategory {
  id: string;
  name: string;
  category_type: 'income' | 'expense' | 'savings';
  expense_type?: 'fixed' | 'variable' | null;
  budgeted_amount: number;
  actual_amount: number;
  icon_name?: string;
  color_hex: string;
  is_essential?: boolean | null;
  description?: string;
}

interface BudgetSubcategory {
  id: string;
  category_id: string;
  name: string;
  budgeted_amount: number;
  actual_amount: number;
  description?: string;
  sort_order: number;
}

interface UserBudget {
  budget_id: string;
  budget_month: number;
  budget_year: number;
  status: string;
}

export default function BudgetDashboard() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.budgetId as string;
  
  // Estados principales
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [subcategories, setSubcategories] = useState<BudgetSubcategory[]>([]);
  const [userBudgets, setUserBudgets] = useState<UserBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de edición
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string | number>>({});
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  
  // Estados para editar subcategorías
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editSubcategoryValues, setEditSubcategoryValues] = useState<Record<string, any>>({});
  
  // Estados para crear nuevas categorías
  const [showNewCategoryForm, setShowNewCategoryForm] = useState<string | null>(null);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    amount: '',
    description: '',
    isEssential: false
  });
  
  // Estados para subcategorías
  const [showSubcategoryForm, setShowSubcategoryForm] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [newSubcategoryData, setNewSubcategoryData] = useState({
    name: '',
    amount: '',
    description: ''
  });
  
  // Estados para transacciones
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  
  // 🆕 Estados para lista de transacciones por subcategoría
  const [showTransactionList, setShowTransactionList] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    id: string;
    name: string;
    categoryName: string;
  } | null>(null);

  // 🆕 Estado para reporte financiero con IA
  const [showFinancialReport, setShowFinancialReport] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  // Cliente Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 🎯 Product Tour Configuration para Dashboard de Presupuesto
  const budgetTourSteps = [
    {
      element: '#tour-budget-header',
      popover: {
        title: '📅 Encabezado del Presupuesto',
        description: 'Aquí ves el mes y año del presupuesto actual. Puedes cambiar entre diferentes meses usando el selector.',
        side: 'bottom' as const,
        align: 'start' as const,
      },
    },
    {
      element: '#tour-budget-summary',
      popover: {
        title: '💰 Resumen Financiero',
        description: 'Vista rápida de tus ingresos, gastos y balance. Los colores te indican si estás dentro de tu presupuesto (verde) o necesitas ajustar (rojo).',
        side: 'bottom' as const,
        align: 'start' as const,
      },
    },
    {
      element: '#tour-budget-charts',
      popover: {
        title: '📊 Gráficas de Análisis',
        description: 'Visualiza la distribución de tu presupuesto, comparación entre presupuestado vs real, gastos por prioridad y cumplimiento de la regla 50/30/20.',
        side: 'bottom' as const,
        align: 'start' as const,
      },
    },
    {
      element: '#tour-budget-categories',
      popover: {
        title: '📝 Categorías del Presupuesto',
        description: 'Gestiona tus ingresos, gastos fijos, gastos variables y ahorros. Haz clic en cada categoría para ver subcategorías y registrar transacciones.',
        side: 'top' as const,
        align: 'start' as const,
      },
    },
    {
      element: '#tour-ai-button',
      popover: {
        title: '🤖 Asistente IA',
        description: 'Usa el asistente para registrar gastos por voz, editar tu presupuesto o hacer consultas. También puedes generar reportes financieros inteligentes.',
        side: 'left' as const,
        align: 'center' as const,
      },
    },
  ];

  const { startTour, resetTour } = useTour({
    tourId: 'dashboard-budget',
    steps: budgetTourSteps,
    autoStart: true,
  });

  useEffect(() => {
    loadBudgetData();
    loadUserBudgets();
  }, [budgetId]);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Recargando datos del presupuesto...', budgetId);
      
      // Cargar datos del presupuesto
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

      if (budgetError) {
        console.error('Error cargando presupuesto:', budgetError);
        setError('No se pudo cargar el presupuesto');
        return;
      }

      setBudget(budgetData);
      console.log('✅ Presupuesto cargado:', budgetData);

      // Cargar categorías del presupuesto
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budgetId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        console.error('Error cargando categorías:', categoriesError);
      } else {
        setCategories(categoriesData || []);
        console.log('✅ Categorías cargadas:', categoriesData?.length);
      }

      // Cargar subcategorías del presupuesto
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('budget_subcategories')
        .select('*')
        .eq('budget_id', budgetId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (subcategoriesError) {
        console.error('Error cargando subcategorías:', subcategoriesError);
      } else {
        setSubcategories(subcategoriesData || []);
        console.log('✅ Subcategorías cargadas:', subcategoriesData?.length);
      }

    } catch (err) {
      console.error('Error general:', err);
      setError('Error cargando datos del presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const loadUserBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: budgetsData, error } = await supabase
        .from('budgets')
        .select('id, budget_month, budget_year, status')
        .eq('user_id', user.id)
        .order('budget_year', { ascending: false })
        .order('budget_month', { ascending: false });

      if (!error && budgetsData) {
        // Mapear los datos para coincidir con la interfaz UserBudget
        const mappedBudgets = budgetsData.map(budget => ({
          budget_id: budget.id,
          budget_month: budget.budget_month,
          budget_year: budget.budget_year,
          status: budget.status
        }));
        setUserBudgets(mappedBudgets);
      }
    } catch (error) {
      console.error('Error cargando presupuestos del usuario:', error);
    }
  };

  const handleEditCategory = (categoryId: string, field: string, value: string | number) => {
    setEditingCategory(categoryId);
    setEditValues({ ...editValues, [`${categoryId}_${field}`]: value });
  };

  const saveCategory = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      const updates: Record<string, string | number> = {};
      
      // Recopilar cambios
      Object.keys(editValues).forEach(key => {
        if (key.startsWith(`${categoryId}_`)) {
          const field = key.replace(`${categoryId}_`, '');
          updates[field] = editValues[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        setEditingCategory(null);
        return;
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from('budget_categories')
        .update(updates)
        .eq('id', categoryId);

      if (error) {
        console.error('Error actualizando categoría:', error);
        return;
      }

      // Actualizar estado local
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ));

      // Limpiar estado de edición
      Object.keys(editValues).forEach(key => {
        if (key.startsWith(`${categoryId}_`)) {
          delete editValues[key];
        }
      });

      setEditingCategory(null);
      
      // Recalcular totales del presupuesto
      await updateBudgetTotals();
      
    } catch (error) {
      console.error('Error guardando categoría:', error);
    }
  };

  const updateBudgetTotals = async () => {
    // 🆕 Calcular totales PRESUPUESTADOS (no reales)
    const income = getTotalBudgetedByType('income');
    const fixedExpenses = getTotalBudgetedByType('expense', 'fixed');
    const variableExpenses = getTotalBudgetedByType('expense', 'variable');
    const savings = getTotalBudgetedByType('savings');

    const { error } = await supabase
      .from('budgets')
      .update({
        total_income: income,
        total_fixed_expenses: fixedExpenses,
        total_variable_expenses: variableExpenses,
        total_savings: savings
      })
      .eq('id', budgetId);

    if (!error && budget) {
      setBudget({
        ...budget,
        total_income: income,
        total_fixed_expenses: fixedExpenses,
        total_variable_expenses: variableExpenses,
        total_savings: savings
      });
    }
  };

  const switchToBudget = (newBudgetId: string) => {
    router.push(`/dashboard/budget/${newBudgetId}`);
  };

  const createNewBudget = () => {
    router.push('/budget/create');
  };

  const resetNewCategoryForm = () => {
    setNewCategoryData({
      name: '',
      amount: '',
      description: '',
      isEssential: false
    });
    setShowNewCategoryForm(null);
  };

  const createNewCategory = async (type: 'income' | 'fixed_expense' | 'variable_expense' | 'savings') => {
    try {
      if (!newCategoryData.name.trim() || !newCategoryData.amount) {
        alert('Por favor completa el nombre y el monto de la categoría');
        return;
      }

      // ✅ VALIDAR: Verificar que el nombre no exista como categoría
      const categoryNameExists = categories.some(
        c => c.name.toLowerCase().trim() === newCategoryData.name.toLowerCase().trim()
      );
      
      if (categoryNameExists) {
        alert(`Ya existe una categoría con el nombre "${newCategoryData.name}". Por favor elige un nombre diferente.`);
        return;
      }

      // ✅ VALIDAR: Verificar que el nombre no exista como subcategoría
      const subcategoryNameExists = subcategories.some(
        s => s.name?.toLowerCase().trim() === newCategoryData.name.toLowerCase().trim()
      );
      
      if (subcategoryNameExists) {
        alert(`Ya existe una subcategoría con el nombre "${newCategoryData.name}". Para evitar confusiones, por favor elige un nombre diferente.`);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mapear el tipo antiguo al nuevo esquema
      let categoryType: 'income' | 'expense' | 'savings' = 'expense';
      let expenseType: 'fixed' | 'variable' | null = null;
      let isEssential: boolean | null = null;

      if (type === 'income') {
        categoryType = 'income';
      } else if (type === 'savings') {
        categoryType = 'savings';
      } else if (type === 'fixed_expense') {
        categoryType = 'expense';
        expenseType = 'fixed';
        isEssential = newCategoryData.isEssential;
      } else if (type === 'variable_expense') {
        categoryType = 'expense';
        expenseType = 'variable';
        isEssential = newCategoryData.isEssential;
      }

      const categoryToInsert = {
        budget_id: budgetId,
        user_id: user.id,
        name: newCategoryData.name.trim(),
        description: newCategoryData.description.trim() || null,
        category_type: categoryType,
        expense_type: expenseType,
        budgeted_amount: parseFloat(newCategoryData.amount) || 0,
        actual_amount: 0,
        is_essential: isEssential,
        color_hex: type === 'income' ? '#10B981' : type === 'fixed_expense' ? '#EF4444' : type === 'variable_expense' ? '#F59E0B' : '#8B5CF6',
        icon_name: 'Circle',
        sort_order: categories.filter(c => {
          if (categoryType === 'expense') {
            return c.category_type === 'expense' && c.expense_type === expenseType;
          }
          return c.category_type === categoryType;
        }).length + 1,
        is_active: true
      };

      const { data, error } = await supabase
        .from('budget_categories')
        .insert(categoryToInsert)
        .select('*')
        .single();

      if (error) {
        console.error('Error creando categoría:', error);
        alert('Error creando la categoría. Inténtalo de nuevo.');
        return;
      }

      // Agregar la nueva categoría al estado local
      setCategories(prev => [...prev, data]);
      
      // Recalcular totales
      await updateBudgetTotals();
      
      // Resetear el formulario
      resetNewCategoryForm();
      
      console.log('✅ Nueva categoría creada:', data);
      
    } catch (error) {
      console.error('Error creando categoría:', error);
      alert('Error inesperado creando la categoría');
    }
  };

  // Función para eliminar categoría
  const deleteCategory = async (categoryId: string) => {
    try {
      const categoryToDelete = categories.find(c => c.id === categoryId);
      if (!categoryToDelete) return;

      // Confirmar eliminación
      const confirmDelete = window.confirm(
        `¿Estás seguro de que quieres eliminar "${categoryToDelete.name}"?\n\nEsta acción no se puede deshacer y también eliminará todas sus subcategorías.`
      );

      if (!confirmDelete) return;

      // Primero eliminar todas las subcategorías asociadas
      const categorySubcategories = getCategorySubcategories(categoryId);
      if (categorySubcategories.length > 0) {
        const { error: subcategoriesError } = await supabase
          .from('budget_subcategories')
          .delete()
          .eq('category_id', categoryId);

        if (subcategoriesError) {
          console.error('Error eliminando subcategorías:', subcategoriesError);
          alert('Error eliminando las subcategorías asociadas');
          return;
        }
      }

      // Luego eliminar la categoría
      const { error } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error eliminando categoría:', error);
        alert('Error eliminando la categoría. Inténtalo de nuevo.');
        return;
      }

      // Actualizar estado local
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setSubcategories(prev => prev.filter(s => s.category_id !== categoryId));
      
      // Recalcular totales
      await updateBudgetTotals();
      
      console.log('✅ Categoría eliminada exitosamente');
      
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('Error inesperado eliminando la categoría');
    }
  };

  const getIconForCategoryType = (categoryType: string): string => {
    const iconMap = {
      income: 'Briefcase',
      fixed_expense: 'Home',
      variable_expense: 'ShoppingCart'
    };
    return iconMap[categoryType as keyof typeof iconMap] || 'Circle';
  };

  // Función para obtener color para categoría (copiada desde el API)
  const getColorForCategory = (type: string, index: number): string => {
    const colorPalettes = {
      income: ['#10B981', '#059669', '#047857', '#065F46'],
      fixed_expense: ['#DC2626', '#EA580C', '#D97706', '#CA8A04'],
      variable_expense: ['#7C2D12', '#78350F', '#BE185D', '#A21CAF']
    };
    
    const palette = colorPalettes[type as keyof typeof colorPalettes] || colorPalettes.variable_expense;
    return palette[index % palette.length];
  };

  // Funciones para manejar subcategorías
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const resetSubcategoryForm = () => {
    setNewSubcategoryData({
      name: '',
      amount: '',
      description: ''
    });
    setShowSubcategoryForm(null);
  };

  const createSubcategory = async (categoryId: string) => {
    try {
      if (!newSubcategoryData.name.trim() || !newSubcategoryData.amount) {
        alert('Por favor completa el nombre y el monto de la subcategoría');
        return;
      }

      // ✅ VALIDAR: Verificar que el nombre no exista como categoría
      const categoryNameExists = categories.some(
        c => c.name.toLowerCase().trim() === newSubcategoryData.name.toLowerCase().trim()
      );
      
      if (categoryNameExists) {
        alert(`Ya existe una categoría con el nombre "${newSubcategoryData.name}". Por favor elige un nombre diferente para evitar confusiones.`);
        return;
      }

      // ✅ VALIDAR: Verificar que el nombre no exista como subcategoría en esta categoría
      const subcategoryNameExists = subcategories.some(
        s => s.category_id === categoryId && 
        s.name?.toLowerCase().trim() === newSubcategoryData.name.toLowerCase().trim()
      );
      
      if (subcategoryNameExists) {
        alert(`Ya existe una subcategoría con el nombre "${newSubcategoryData.name}" en esta categoría.`);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subcategoryToInsert = {
        category_id: categoryId,
        budget_id: budgetId,
        user_id: user.id,
        name: newSubcategoryData.name.trim(),
        description: newSubcategoryData.description.trim() || null,
        budgeted_amount: parseFloat(newSubcategoryData.amount) || 0,
        actual_amount: 0,
        sort_order: subcategories.filter(s => s.category_id === categoryId).length + 1,
        is_active: true
      };

      const { data, error } = await supabase
        .from('budget_subcategories')
        .insert(subcategoryToInsert)
        .select('*')
        .single();

      if (error) {
        console.error('Error creando subcategoría:', error);
        alert('Error creando la subcategoría. Inténtalo de nuevo.');
        return;
      }

      // Agregar la nueva subcategoría al estado local
      setSubcategories(prev => [...prev, data]);
      
      // Recalcular totales
      await updateBudgetTotals();
      
      // Resetear el formulario
      resetSubcategoryForm();
      
      console.log('✅ Nueva subcategoría creada:', data);
      
    } catch (error) {
      console.error('Error creando subcategoría:', error);
      alert('Error inesperado creando la subcategoría');
    }
  };

  // Funciones de cálculo con subcategorías
  const getCategorySubcategories = (categoryId: string): BudgetSubcategory[] => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  // 🆕 Calcula el monto REAL (actual_amount) de una categoría
  const getCategoryTotal = (category: BudgetCategory): number => {
    const categorySubcategories = getCategorySubcategories(category.id);
    const subcategoryTotal = categorySubcategories.reduce((sum, sub) => sum + (sub.actual_amount || 0), 0);
    
    // Si la categoría tiene subcategorías, el total es solo la suma de subcategorías (actual_amount)
    // Si no tiene subcategorías, usa el actual_amount de la categoría principal
    return categorySubcategories.length > 0 ? subcategoryTotal : (category.actual_amount || 0);
  };

  // 🆕 Calcula el monto PRESUPUESTADO (budgeted_amount) de una categoría
  const getCategoryBudgetedAmount = (category: BudgetCategory): number => {
    const categorySubcategories = getCategorySubcategories(category.id);
    // Si tiene subcategorías, sumar sus montos presupuestados
    // Si no tiene subcategorías, usar el monto presupuestado de la categoría
    return categorySubcategories.length > 0 
      ? categorySubcategories.reduce((sum, sub) => sum + (sub.budgeted_amount || 0), 0)
      : (category.budgeted_amount || 0);
  };

  const getCategoryDisplayAmount = (category: BudgetCategory): number => {
    return getCategoryBudgetedAmount(category);
  };

  const isCategoryEditable = (category: BudgetCategory): boolean => {
    const categorySubcategories = getCategorySubcategories(category.id);
    // Solo es editable si NO tiene subcategorías
    return categorySubcategories.length === 0;
  };

  // 🆕 Calcula el total PRESUPUESTADO por tipo de categoría
  const getTotalBudgetedByType = (type: 'income' | 'expense' | 'savings', expenseType?: 'fixed' | 'variable'): number => {
    let filteredCategories = categories.filter(c => c.category_type === type);
    
    // Si se especifica expense_type, filtrar también por este
    if (type === 'expense' && expenseType) {
      filteredCategories = filteredCategories.filter(c => c.expense_type === expenseType);
    }
    
    const categoryTotal = filteredCategories.reduce((sum, c) => sum + getCategoryBudgetedAmount(c), 0);
    return categoryTotal;
  };

  // 🆕 Calcula el total REAL (actual) por tipo de categoría
  const getTotalByType = (type: 'income' | 'expense' | 'savings', expenseType?: 'fixed' | 'variable'): number => {
    let filteredCategories = categories.filter(c => c.category_type === type);
    
    // Si se especifica expense_type, filtrar también por este
    if (type === 'expense' && expenseType) {
      filteredCategories = filteredCategories.filter(c => c.expense_type === expenseType);
    }
    
    const categoryTotal = filteredCategories.reduce((sum, c) => sum + getCategoryTotal(c), 0);
    return categoryTotal;
  };

  // Funciones para editar subcategorías
  const handleEditSubcategory = (subcategoryId: string, field: string, value: string | number) => {
    setEditSubcategoryValues(prev => ({
      ...prev,
      [`${subcategoryId}_${field}`]: value
    }));
  };

  const saveSubcategory = async (subcategoryId: string) => {
    try {
      const subcategory = subcategories.find(s => s.id === subcategoryId);
      if (!subcategory) return;

      const updatedSubcategory = {
        name: editSubcategoryValues[`${subcategoryId}_name`] || subcategory.name,
        budgeted_amount: editSubcategoryValues[`${subcategoryId}_budgeted_amount`] || subcategory.budgeted_amount,
        description: editSubcategoryValues[`${subcategoryId}_description`] || subcategory.description
      };

      const { error } = await supabase
        .from('budget_subcategories')
        .update(updatedSubcategory)
        .eq('id', subcategoryId);

      if (error) {
        console.error('Error actualizando subcategoría:', error);
        alert('Error guardando los cambios');
        return;
      }

      // Actualizar estado local
      setSubcategories(prev => prev.map(s => 
        s.id === subcategoryId 
          ? { ...s, ...updatedSubcategory }
          : s
      ));

      // Recalcular totales del presupuesto
      await updateBudgetTotals();

      // Limpiar estado de edición
      setEditingSubcategory(null);
      setEditSubcategoryValues(prev => {
        const newValues = { ...prev };
        delete newValues[`${subcategoryId}_name`];
        delete newValues[`${subcategoryId}_budgeted_amount`];
        delete newValues[`${subcategoryId}_description`];
        return newValues;
      });

      console.log('✅ Subcategoría actualizada correctamente');

    } catch (error) {
      console.error('Error guardando subcategoría:', error);
      alert('Error inesperado guardando los cambios');
    }
  };

  const deleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta subcategoría?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('budget_subcategories')
        .update({ is_active: false })
        .eq('id', subcategoryId);

      if (error) {
        console.error('Error eliminando subcategoría:', error);
        alert('Error eliminando la subcategoría');
        return;
      }

      // Remover del estado local
      setSubcategories(prev => prev.filter(s => s.id !== subcategoryId));
      
      // Recalcular totales
      await updateBudgetTotals();
      
      console.log('✅ Subcategoría eliminada correctamente');

    } catch (error) {
      console.error('Error eliminando subcategoría:', error);
      alert('Error inesperado eliminando la subcategoría');
    }
  };

  // Calcular métricas PRESUPUESTADAS (incluyendo subcategorías)
  const totalBudgeted = getTotalBudgetedByType('income');
  const totalFixedExpenses = getTotalBudgetedByType('expense', 'fixed');
  const totalVariableExpenses = getTotalBudgetedByType('expense', 'variable');
  const totalSavings = getTotalBudgetedByType('savings');
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  const budgetBalance = totalBudgeted - totalExpenses - totalSavings;

  // 🆕 MÉTRICAS AVANZADAS - Calculadas desde categorías (incluye subcategorías)
  const actualIncome = getTotalByType('income');
  const actualFixedExpenses = getTotalByType('expense', 'fixed');
  const actualVariableExpenses = getTotalByType('expense', 'variable');
  const actualExpenses = actualFixedExpenses + actualVariableExpenses;
  const actualSavings = getTotalByType('savings');
  const actualBalance = actualIncome - actualExpenses - actualSavings;
  
  // Calcular gastos esenciales vs no esenciales
  const essentialExpenses = categories
    .filter(c => c.category_type === 'expense' && c.is_essential === true)
    .reduce((sum, c) => sum + getCategoryTotal(c), 0);
  const nonEssentialExpenses = categories
    .filter(c => c.category_type === 'expense' && c.is_essential === false)
    .reduce((sum, c) => sum + getCategoryTotal(c), 0);
  
  // Porcentajes de cumplimiento
  const incomeProgress = totalBudgeted > 0 ? (actualIncome / totalBudgeted) * 100 : 0;
  const expensesProgress = totalExpenses > 0 ? (actualExpenses / totalExpenses) * 100 : 0;
  const savingsProgress = totalSavings > 0 ? (actualSavings / totalSavings) * 100 : 0;
  
  // Regla 50/30/20 (basada en ingresos REALES)
  const rule503020 = {
    needs: actualIncome > 0 ? (essentialExpenses / actualIncome) * 100 : 0, // 50% necesidades (gastos esenciales)
    wants: actualIncome > 0 ? (nonEssentialExpenses / actualIncome) * 100 : 0, // 30% deseos (gastos no esenciales)
    savings: actualIncome > 0 ? (actualSavings / actualIncome) * 100 : 0, // 20% ahorros
  };
  
  // Salud financiera (0-100)
  const financialHealth = (() => {
    let score = 0;
    // 30 puntos: Balance positivo
    if (actualBalance > 0) score += 30;
    else if (actualBalance > -actualIncome * 0.1) score += 15;
    
    // 25 puntos: Ahorro >= 20%
    if (rule503020.savings >= 20) score += 25;
    else if (rule503020.savings >= 10) score += 15;
    else if (rule503020.savings > 0) score += 5;
    
    // 25 puntos: Gastos <= 80% del ingreso
    const expenseRatio = (actualExpenses / actualIncome) * 100;
    if (expenseRatio <= 70) score += 25;
    else if (expenseRatio <= 80) score += 15;
    else if (expenseRatio <= 90) score += 5;
    
    // 20 puntos: Cumplimiento de presupuesto
    if (Math.abs(expensesProgress - 100) <= 10) score += 20;
    else if (Math.abs(expensesProgress - 100) <= 20) score += 10;
    
    return Math.min(100, score);
  })();
  
  // Nivel de salud
  const healthLevel = 
    financialHealth >= 80 ? { label: 'Excelente', color: 'green', emoji: '🌟' } :
    financialHealth >= 60 ? { label: 'Bueno', color: 'blue', emoji: '👍' } :
    financialHealth >= 40 ? { label: 'Regular', color: 'yellow', emoji: '⚠️' } :
    { label: 'Necesita Atención', color: 'red', emoji: '🚨' };

  // Datos para gráficas (incluyendo subcategorías)
  const pieData = [
    { name: 'Gastos Fijos', value: actualFixedExpenses, color: '#DC2626' },
    { name: 'Gastos Variables', value: actualVariableExpenses, color: '#F59E0B' },
    { name: 'Ahorros', value: actualSavings, color: '#8B5CF6' },
    { name: 'Disponible', value: Math.max(0, actualBalance), color: '#10B981' },
  ].filter(item => item.value > 0);

  // Gráfico de gastos por tipo (Fijos vs Variables)
  const expenseTypeData = [
    { name: 'Gastos Fijos', Presupuestado: totalFixedExpenses, Real: actualFixedExpenses, color: '#DC2626' },
    { name: 'Gastos Variables', Presupuestado: totalVariableExpenses, Real: actualVariableExpenses, color: '#F59E0B' },
  ];

  // Gráfico de gastos por prioridad (Esenciales vs No Esenciales)
  const expensePriorityData = [
    { name: 'Esenciales', value: essentialExpenses, color: '#3B82F6' },
    { name: 'No Esenciales', value: nonEssentialExpenses, color: '#F59E0B' },
  ].filter(item => item.value > 0);

  const barData = [
    {
      name: 'Ingresos',
      Presupuestado: totalBudgeted,
      Real: actualIncome,
    },
    {
      name: 'Gastos Fijos',
      Presupuestado: totalFixedExpenses,
      Real: actualFixedExpenses,
    },
    {
      name: 'Gastos Variables',
      Presupuestado: totalVariableExpenses,
      Real: actualVariableExpenses,
    },
    {
      name: 'Ahorros',
      Presupuestado: totalSavings,
      Real: actualSavings,
    },
  ];

  // Regla 50/30/20 datos
  const rule503020Data = [
    { name: 'Necesidades', value: rule503020.needs, ideal: 50, color: '#3B82F6' },
    { name: 'Deseos', value: rule503020.wants, ideal: 30, color: '#F59E0B' },
    { name: 'Ahorros', value: rule503020.savings, ideal: 20, color: '#8B5CF6' },
  ];

  // Nombres de meses
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu presupuesto...</p>
        </div>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Presupuesto no encontrado'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div id="tour-budget-header" className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Presupuesto {monthNames[budget.budget_month - 1]} {budget.budget_year}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {budget.chat_completed ? '✅ Completado via MentorIA' : '🚧 En construcción'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Botón Tour */}
              <button
                onClick={resetTour}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Iniciar recorrido guiado"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* Botón Reporte con IA */}
              <button
                onClick={() => {
                  console.log('🔘 Click en botón Reporte IA - showFinancialReport:', showFinancialReport);
                  setShowFinancialReport(true);
                  console.log('🔘 Estado actualizado a true');
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <Zap className="w-4 h-4" />
                <span className="font-medium">Reporte IA</span>
              </button>

              {/* Selector de presupuesto */}
              <div className="relative">
                <button
                  onClick={() => setShowMonthSelector(!showMonthSelector)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Cambiar período</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {showMonthSelector && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Mis Presupuestos</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {userBudgets.map((userBudget) => (
                        <button
                          key={userBudget.budget_id}
                          onClick={() => {
                            switchToBudget(userBudget.budget_id);
                            setShowMonthSelector(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                            userBudget.budget_id === budgetId ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              {monthNames[userBudget.budget_month - 1]} {userBudget.budget_year}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              userBudget.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {userBudget.status === 'active' ? 'Activo' : userBudget.status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          createNewBudget();
                          setShowMonthSelector(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Crear nuevo presupuesto</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen de métricas - KPIs Mejorados */}
        <div id="tour-budget-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Ingresos Real vs Presupuestado */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-emerald-700">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ${actualIncome.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-700">Presupuestado: ${totalBudgeted.toLocaleString()}</span>
                <span className={`font-bold ${incomeProgress >= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {incomeProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${incomeProgress >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min(incomeProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Gastos Real vs Presupuestado */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-red-700">Gastos del Mes</p>
                <p className="text-3xl font-bold text-red-600">
                  ${actualExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-7 h-7 text-red-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-red-700">Presupuestado: ${totalExpenses.toLocaleString()}</span>
                <span className={`font-bold ${expensesProgress <= 100 ? 'text-green-600' : expensesProgress <= 110 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {expensesProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${expensesProgress <= 100 ? 'bg-green-500' : expensesProgress <= 110 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(expensesProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Ahorros Real vs Presupuestado */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-purple-700">Ahorros del Mes</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${actualSavings.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-purple-700">Meta: ${totalSavings.toLocaleString()}</span>
                <span className={`font-bold ${savingsProgress >= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {savingsProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${savingsProgress >= 100 ? 'bg-purple-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Salud Financiera */}
          <div className={`bg-gradient-to-br ${
            healthLevel.color === 'green' ? 'from-green-50 to-emerald-50 border-green-200' :
            healthLevel.color === 'blue' ? 'from-blue-50 to-cyan-50 border-blue-200' :
            healthLevel.color === 'yellow' ? 'from-yellow-50 to-amber-50 border-yellow-200' :
            'from-red-50 to-rose-50 border-red-200'
          } rounded-xl shadow-lg p-6 border`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Salud Financiera</p>
                <p className="text-3xl font-bold text-gray-900">
                  {financialHealth.toFixed(0)}
                  <span className="text-lg text-gray-500">/100</span>
                </p>
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                healthLevel.color === 'green' ? 'bg-green-100' :
                healthLevel.color === 'blue' ? 'bg-blue-100' :
                healthLevel.color === 'yellow' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                {healthLevel.emoji}
              </div>
            </div>
            <div className="space-y-1">
              <p className={`text-sm font-bold ${
                healthLevel.color === 'green' ? 'text-green-600' :
                healthLevel.color === 'blue' ? 'text-blue-600' :
                healthLevel.color === 'yellow' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {healthLevel.label}
              </p>
              <div className={`w-full rounded-full h-2 ${
                healthLevel.color === 'green' ? 'bg-green-200' :
                healthLevel.color === 'blue' ? 'bg-blue-200' :
                healthLevel.color === 'yellow' ? 'bg-yellow-200' :
                'bg-red-200'
              }`}>
                <div 
                  className={`h-2 rounded-full transition-all ${
                    healthLevel.color === 'green' ? 'bg-green-500' :
                    healthLevel.color === 'blue' ? 'bg-blue-500' :
                    healthLevel.color === 'yellow' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${financialHealth}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficas */}
        <div id="tour-budget-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de distribución presupuesto */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Distribución del Presupuesto
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    labelFormatter={(label) => label}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de comparación Presupuestado vs Real */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Presupuestado vs Real
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="Presupuestado" fill="#3B82F6" />
                  <Bar dataKey="Real" fill="#10B981" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Gastos por Prioridad (Esenciales vs No Esenciales) */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Gastos por Prioridad
            </h3>
            {expensePriorityData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={expensePriorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expensePriorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        labelFormatter={(label) => label}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  {expensePriorityData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{entry.name}</span>
                      <span className="text-sm font-semibold text-gray-700">
                        ${entry.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>No hay datos de gastos clasificados</p>
              </div>
            )}
          </div>

          {/* Regla 50/30/20 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Regla 50/30/20
            </h3>
            <div className="space-y-4">
              {rule503020Data.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        Math.abs(item.value - item.ideal) <= 5 ? 'text-green-600' :
                        Math.abs(item.value - item.ideal) <= 10 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {item.value.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">/ {item.ideal}%</span>
                    </div>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-3">
                    {/* Zona ideal */}
                    <div 
                      className="absolute h-3 bg-green-100 rounded-full opacity-50"
                      style={{ 
                        left: `${Math.max(0, item.ideal - 5)}%`, 
                        width: '10%'
                      }}
                    ></div>
                    {/* Progreso real */}
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        Math.abs(item.value - item.ideal) <= 5 ? 'bg-green-500' :
                        Math.abs(item.value - item.ideal) <= 10 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(item.value, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {Math.abs(item.value - item.ideal) <= 5 ? '✅ Dentro del rango ideal' :
                     item.value < item.ideal ? `⚠️ ${(item.ideal - item.value).toFixed(1)}% por debajo` :
                     `⚠️ ${(item.value - item.ideal).toFixed(1)}% por encima`}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 font-medium mb-2">📚 ¿Qué es la regla 50/30/20?</p>
              <ul className="text-xs text-purple-600 space-y-1">
                <li>• 50% para necesidades (gastos esenciales)</li>
                <li>• 30% para deseos (gastos no esenciales)</li>
                <li>• 20% para ahorros e inversiones</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Dashboard de Presupuesto - Diseño Glassmorphism Moderno */}
        {categories.length === 0 ? (
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-600 mb-4">
                Este presupuesto aún no tiene categorías definidas.
              </p>
              <button
                onClick={createNewBudget}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear presupuesto con MentorIA
              </button>
            </div>
          </div>
        ) : (
          <div id="tour-budget-categories" className="space-y-8">
            
            {/* Sección de Ingresos - Glassmorphism */}
            <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/30 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">💰 Ingresos Mensuales</h3>
                      <p className="text-emerald-100 text-sm">
                        {categories.filter(c => c.category_type === 'income' && !c.name.toLowerCase().includes('ahorro')).length} fuentes • ${(totalBudgeted - totalSavings).toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewCategoryForm(showNewCategoryForm === 'income' ? null : 'income')}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Ingreso
                  </button>
                </div>
              </div>

              {/* Formulario para nuevo ingreso */}
              {showNewCategoryForm === 'income' && (
                <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm px-6 py-4 border-b border-emerald-100/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      value={newCategoryData.name}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del ingreso"
                      className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-emerald-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      value={newCategoryData.amount}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Monto mensual"
                      className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-emerald-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      value={newCategoryData.description}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción (opcional)"
                      className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-emerald-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => createNewCategory('income')}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        Crear
                      </button>
                      <button
                        onClick={resetNewCategoryForm}
                        className="px-4 py-2 text-emerald-600 hover:bg-emerald-100/50 rounded-xl transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla de Ingresos con Glassmorphism */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm border-b border-gray-200/50">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">Categoría</th>
                      <th className="text-right py-3 px-6 font-semibold text-gray-700">Presupuestado</th>
                      <th className="text-right py-3 px-6 font-semibold text-gray-700">Real</th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">Progreso</th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {categories
                      .filter(c => c.category_type === 'income' && !c.name.toLowerCase().includes('ahorro'))
                      .map((category, index) => {
                        const categorySubcategories = getCategorySubcategories(category.id);
                        const categoryTotal = getCategoryTotal(category);
                        const categoryBudgeted = getCategoryDisplayAmount(category);
                        const percentage = categoryBudgeted > 0 ? (categoryTotal / categoryBudgeted) * 100 : 0;
                        const isExpanded = expandedCategories.has(category.id);
                        
                        return (
                          <React.Fragment key={category.id || `income-cat-${index}`}>
                            {/* Fila principal de categoría */}
                            <tr 
                              onClick={(e) => {
                                // No abrir modal si se hace click en botones de edición
                                if ((e.target as HTMLElement).closest('button')) return;
                                setSelectedCategory(category);
                                setShowTransactionModal(true);
                              }}
                              className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-green-50/30 transition-all duration-200 group cursor-pointer">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  {categorySubcategories.length > 0 && (
                                    <button
                                      onClick={() => toggleCategoryExpansion(category.id)}
                                      className="p-1 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-100/50 transition-all duration-200"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}
                                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 shadow-sm"></div>
                                  <div className="flex-1">
                                    {editingCategory === category.id ? (
                                      <input
                                        type="text"
                                        value={editValues[`${category.id}_name`] || category.name}
                                        onChange={(e) => handleEditCategory(category.id, 'name', e.target.value)}
                                        className="font-medium text-gray-900 backdrop-blur-sm bg-white/70 border border-gray-300/50 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 transition-all"
                                        onBlur={() => saveCategory(category.id)}
                                        onKeyPress={(e) => e.key === 'Enter' && saveCategory(category.id)}
                                        autoFocus
                                      />
                                    ) : (
                                      <h4 className="font-semibold text-gray-900">{category.name || 'Sin nombre'}</h4>
                                    )}
                                    {category.description && (
                                      <p className="text-sm text-gray-500">{category.description}</p>
                                    )}
                                    {categorySubcategories.length > 0 && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="px-2 py-1 bg-emerald-100/60 backdrop-blur-sm rounded-lg">
                                          <p className="text-xs text-emerald-700 font-medium">
                                            {categorySubcategories.length} subcategorías
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => setShowSubcategoryForm(showSubcategoryForm === category.id ? null : category.id)}
                                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:bg-emerald-100/50 px-2 py-1 rounded-lg transition-all duration-200"
                                        >
                                          + Agregar subcategoría
                                        </button>
                                      </div>
                                    )}
                                    {categorySubcategories.length === 0 && (
                                      <button
                                        onClick={() => setShowSubcategoryForm(category.id)}
                                        className="text-xs text-gray-500 hover:text-emerald-600 font-medium hover:bg-emerald-100/50 px-2 py-1 rounded-lg transition-all duration-200 mt-1"
                                      >
                                        + Crear subcategoría
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-right">
                                {editingCategory === category.id && isCategoryEditable(category) ? (
                                  <input
                                    type="number"
                                    value={editValues[`${category.id}_budgeted_amount`] || category.budgeted_amount}
                                    onChange={(e) => handleEditCategory(category.id, 'budgeted_amount', parseFloat(e.target.value) || 0)}
                                    className="text-right font-bold text-gray-600 backdrop-blur-sm bg-white/70 border border-gray-300/50 rounded-lg px-2 py-1 w-32 focus:ring-2 focus:ring-emerald-500 transition-all"
                                    onBlur={() => saveCategory(category.id)}
                                    onKeyPress={(e) => e.key === 'Enter' && saveCategory(category.id)}
                                  />
                                ) : (
                                  <span className="text-lg font-bold text-gray-600">
                                    ${(categoryBudgeted || 0).toLocaleString()}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className={`text-lg font-bold ${
                                  percentage > 100 ? 'text-green-700' : 
                                  percentage > 80 ? 'text-green-600' : 
                                  'text-yellow-600'
                                }`}>
                                  ${(categoryTotal || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col items-center gap-2">
                                  {/* Barra de progreso */}
                                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${
                                        percentage > 100 ? 'bg-green-500' : 
                                        percentage > 80 ? 'bg-green-400' : 
                                        'bg-yellow-500'
                                      }`}
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                  </div>
                                  {/* Porcentaje y estado */}
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs font-medium ${
                                      percentage > 100 ? 'text-green-700' : 
                                      percentage > 80 ? 'text-green-600' : 
                                      'text-yellow-600'
                                    }`}>
                                      {percentage.toFixed(0)}%
                                    </span>
                                    {percentage >= 100 && <span className="text-xs">✅</span>}
                                    {percentage >= 80 && percentage < 100 && <span className="text-xs">⚡</span>}
                                    {percentage < 80 && <span className="text-xs">⚠️</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  {editingCategory === category.id ? (
                                    <button
                                      onClick={() => saveCategory(category.id)}
                                      className="p-2 text-emerald-600 hover:bg-emerald-100/50 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm"
                                      title="Guardar"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setEditingCategory(category.id)}
                                      className="p-2 text-blue-600 hover:bg-blue-100/50 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm"
                                      title="Editar"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteCategory(category.id)}
                                    className="p-2 text-red-600 hover:bg-red-100/50 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  {categorySubcategories.length > 0 && (
                                    <button
                                      onClick={() => toggleCategoryExpansion(category.id)}
                                      className="p-2 text-gray-600 hover:bg-gray-100/50 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm"
                                      title={isExpanded ? "Ocultar" : "Mostrar"}
                                    >
                                      {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Formulario para nueva subcategoría - Glassmorphism */}
                            {showSubcategoryForm === category.id && (
                              <tr>
                                <td colSpan={5} className="py-4 px-6">
                                  <div className="backdrop-blur-md bg-gradient-to-r from-emerald-50/60 to-green-50/60 border border-emerald-200/30 rounded-2xl p-4 shadow-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                      <h5 className="font-medium text-emerald-800">Nueva subcategoría para {category.name}</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                      <input
                                        type="text"
                                        value={newSubcategoryData.name}
                                        onChange={(e) => setNewSubcategoryData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nombre subcategoría"
                                        className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-emerald-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                                      />
                                      <input
                                        type="number"
                                        value={newSubcategoryData.amount}
                                        onChange={(e) => setNewSubcategoryData(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="Monto"
                                        className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-emerald-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                                      />
                                      <input
                                        type="text"
                                        value={newSubcategoryData.description}
                                        onChange={(e) => setNewSubcategoryData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Descripción"
                                        className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-emerald-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => createSubcategory(category.id)}
                                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-3 py-2 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-lg"
                                        >
                                          Crear
                                        </button>
                                        <button
                                          onClick={resetSubcategoryForm}
                                          className="px-3 py-2 text-emerald-600 hover:bg-emerald-100/50 rounded-xl transition-all duration-200"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}

                            {/* Subcategorías expandidas - Diseño Glassmorphism */}
                            {isExpanded && categorySubcategories.map((subcategory, subIndex) => {
                              const subPercentage = subcategory.budgeted_amount > 0 
                                ? ((subcategory.actual_amount || 0) / subcategory.budgeted_amount) * 100 
                                : 0;
                              
                              return (
                              <tr key={subcategory.id || `income-sub-${category.id}-${subIndex}`} className="bg-gradient-to-r from-emerald-50/20 to-green-50/20 backdrop-blur-sm hover:from-emerald-50/40 hover:to-green-50/40 transition-all">
                                <td className="py-3 px-6 pl-16">
                                  <div 
                                    className="backdrop-blur-md bg-white/50 border border-emerald-200/30 rounded-xl p-3 shadow-sm cursor-pointer hover:bg-white/70 hover:border-emerald-300/50 transition-all"
                                    onClick={() => {
                                      setSelectedSubcategory({
                                        id: subcategory.id,
                                        name: subcategory.name || 'Sin nombre',
                                        categoryName: category.name || 'Sin categoría'
                                      });
                                      setShowTransactionList(true);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-400"></div>
                                      <div className="flex-1">
                                        {editingSubcategory === subcategory.id ? (
                                          <input
                                            type="text"
                                            value={editSubcategoryValues[`${subcategory.id}_name`] || subcategory.name}
                                            onChange={(e) => handleEditSubcategory(subcategory.id, 'name', e.target.value)}
                                            className="font-medium text-gray-800 backdrop-blur-sm bg-white/70 border border-gray-300/50 rounded-lg px-2 py-1 text-sm w-full focus:ring-2 focus:ring-emerald-500 transition-all"
                                            onBlur={() => saveSubcategory(subcategory.id)}
                                            onKeyPress={(e) => e.key === 'Enter' && saveSubcategory(subcategory.id)}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        ) : (
                                          <h5 className="font-medium text-gray-800 text-sm">{subcategory.name || 'Sin nombre'}</h5>
                                        )}
                                        {subcategory.description && (
                                          <p className="text-xs text-gray-500 mt-1">{subcategory.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-6 text-right">
                                  {editingSubcategory === subcategory.id ? (
                                    <input
                                      type="number"
                                      value={editSubcategoryValues[`${subcategory.id}_budgeted_amount`] || subcategory.budgeted_amount}
                                      onChange={(e) => handleEditSubcategory(subcategory.id, 'budgeted_amount', parseFloat(e.target.value) || 0)}
                                      className="text-right font-semibold text-gray-600 backdrop-blur-sm bg-white/70 border border-gray-300/50 rounded-lg px-2 py-1 w-28 focus:ring-2 focus:ring-emerald-500 transition-all"
                                      onBlur={() => saveSubcategory(subcategory.id)}
                                      onKeyPress={(e) => e.key === 'Enter' && saveSubcategory(subcategory.id)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <span className="font-semibold text-gray-600">
                                      ${(subcategory.budgeted_amount || 0).toLocaleString()}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-6 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className={`font-semibold ${
                                      subPercentage > 100 ? 'text-green-700' : 
                                      subPercentage > 80 ? 'text-green-600' : 
                                      'text-yellow-600'
                                    }`}>
                                      ${(subcategory.actual_amount || 0).toLocaleString()}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSubcategory({
                                          id: subcategory.id,
                                          name: subcategory.name || 'Sin nombre',
                                          categoryName: category.name || 'Sin categoría'
                                        });
                                        setShowTransactionList(true);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline mt-1"
                                    >
                                      Ver transacciones
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex flex-col items-center gap-1">
                                    {/* Barra de progreso */}
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all ${
                                          subPercentage > 100 ? 'bg-green-500' : 
                                          subPercentage > 80 ? 'bg-green-400' : 
                                          'bg-yellow-500'
                                        }`}
                                        style={{ width: `${Math.min(subPercentage, 100)}%` }}
                                      ></div>
                                    </div>
                                    {/* Porcentaje */}
                                    <span className={`text-xs font-medium ${
                                      subPercentage > 100 ? 'text-green-700' : 
                                      subPercentage > 80 ? 'text-green-600' : 
                                      'text-yellow-600'
                                    }`}>
                                      {subPercentage.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {editingSubcategory === subcategory.id ? (
                                      <button
                                        onClick={() => saveSubcategory(subcategory.id)}
                                        className="p-1 text-emerald-600 hover:bg-emerald-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                        title="Guardar"
                                      >
                                        <Save className="w-3 h-3" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setEditingSubcategory(subcategory.id)}
                                        className="p-1 text-blue-600 hover:bg-blue-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                        title="Editar"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteSubcategory(subcategory.id)}
                                      className="p-1 text-red-600 hover:bg-red-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección Unificada de GASTOS */}
            <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/30 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 via-rose-600 to-orange-500 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">💰 GASTOS</h3>
                      <p className="text-white/90 text-sm">
                        {categories.filter(c => c.category_type === 'expense').length} categorías • ${(totalExpenses || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNewCategoryForm(showNewCategoryForm === 'fixed_expense' ? null : 'fixed_expense')}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Gasto Fijo
                    </button>
                    <button
                      onClick={() => setShowNewCategoryForm(showNewCategoryForm === 'variable_expense' ? null : 'variable_expense')}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Gasto Variable
                    </button>
                  </div>
                </div>
              </div>

              {/* Formulario para nuevo gasto fijo */}
              {showNewCategoryForm === 'fixed_expense' && (
                <div className="bg-gradient-to-r from-red-50/80 to-rose-50/80 backdrop-blur-sm px-6 py-4 border-b border-red-100/50">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newCategoryData.name}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del gasto fijo"
                      className="w-full px-3 py-2 backdrop-blur-sm bg-white/70 border border-red-200/50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="number"
                        value={newCategoryData.amount}
                        onChange={(e) => setNewCategoryData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Monto mensual"
                        className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-red-200/50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                      <div className="flex items-center gap-2 px-3 py-2 backdrop-blur-sm bg-white/70 border border-red-200/50 rounded-xl">
                        <input
                          type="checkbox"
                          id="isEssential"
                          checked={newCategoryData.isEssential}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, isEssential: e.target.checked }))}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor="isEssential" className="text-sm text-gray-700 cursor-pointer">
                          Esencial
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => createNewCategory('fixed_expense')}
                          className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-2 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium shadow-lg"
                        >
                          Crear
                        </button>
                        <button
                          onClick={resetNewCategoryForm}
                          className="px-3 py-2 text-red-600 hover:bg-red-100/50 rounded-xl transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario para nuevo gasto variable */}
              {showNewCategoryForm === 'variable_expense' && (
                <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm px-6 py-4 border-b border-orange-100/50">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newCategoryData.name}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del gasto variable"
                      className="w-full px-3 py-2 backdrop-blur-sm bg-white/70 border border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="number"
                        value={newCategoryData.amount}
                        onChange={(e) => setNewCategoryData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Monto mensual"
                        className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                      <div className="flex items-center gap-2 px-3 py-2 backdrop-blur-sm bg-white/70 border border-orange-200/50 rounded-xl">
                        <input
                          type="checkbox"
                          id="isEssentialVar"
                          checked={newCategoryData.isEssential}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, isEssential: e.target.checked }))}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="isEssentialVar" className="text-sm text-gray-700 cursor-pointer">
                          Esencial
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => createNewCategory('variable_expense')}
                          className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3 py-2 rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all duration-200 font-medium shadow-lg"
                        >
                          Crear
                        </button>
                        <button
                          onClick={resetNewCategoryForm}
                          className="px-3 py-2 text-orange-600 hover:bg-orange-100/50 rounded-xl transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla Unificada de Gastos */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm border-b border-gray-200/50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Categoría</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Tipo</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Prioridad</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Presupuestado</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Real</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Progreso</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {categories
                      .filter(c => c.category_type === 'expense')
                      .sort((a, b) => {
                        // Ordenar por expense_type primero (fixed antes que variable)
                        if (a.expense_type !== b.expense_type) {
                          return a.expense_type === 'fixed' ? -1 : 1;
                        }
                        // Luego por is_essential (esenciales primero)
                        if (a.is_essential !== b.is_essential) {
                          return a.is_essential ? -1 : 1;
                        }
                        return 0;
                      })
                      .map((category, index) => {
                        const categorySubcategories = getCategorySubcategories(category.id);
                        const categoryTotal = getCategoryTotal(category);
                        const categoryBudgeted = getCategoryDisplayAmount(category);
                        const percentage = categoryBudgeted > 0 ? (categoryTotal / categoryBudgeted) * 100 : 0;
                        const isExpanded = expandedCategories.has(category.id);
                        const isFixed = category.expense_type === 'fixed';
                        const colorClass = isFixed ? 'red' : 'orange';
                        
                        return (
                          <React.Fragment key={category.id || `expense-cat-${index}`}>
                            {/* Fila principal */}
                            <tr 
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button')) return;
                                setSelectedCategory(category);
                                setShowTransactionModal(true);
                              }}
                              className={`hover:bg-gradient-to-r hover:from-${colorClass}-50/30 hover:to-${colorClass === 'red' ? 'rose' : 'amber'}-50/30 transition-all duration-200 group cursor-pointer`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {/* Botón de expansión o espacio reservado para alineación */}
                                  {categorySubcategories.length > 0 ? (
                                    <button
                                      onClick={() => toggleCategoryExpansion(category.id)}
                                      className={`p-1 text-gray-400 hover:text-${colorClass}-600 rounded-lg hover:bg-${colorClass}-100/50 transition-all duration-200`}
                                    >
                                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </button>
                                  ) : (
                                    <div className="w-5 h-5"></div>
                                  )}
                                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r from-${colorClass}-500 to-${colorClass === 'red' ? 'rose' : 'amber'}-500 shadow-sm`}></div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 text-sm">{category.name || 'Sin nombre'}</h5>
                                    {categorySubcategories.length > 0 && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className={`px-2 py-1 bg-${colorClass}-100/60 backdrop-blur-sm rounded-lg`}>
                                          <p className={`text-xs text-${colorClass}-700 font-medium`}>{categorySubcategories.length} subcategorías</p>
                                        </div>
                                        <button
                                          onClick={() => setShowSubcategoryForm(showSubcategoryForm === category.id ? null : category.id)}
                                          className={`text-xs text-${colorClass}-600 hover:text-${colorClass}-700 font-medium hover:bg-${colorClass}-100/50 px-2 py-1 rounded-lg transition-all duration-200`}
                                        >
                                          + Agregar
                                        </button>
                                      </div>
                                    )}
                                    {categorySubcategories.length === 0 && (
                                      <button
                                        onClick={() => setShowSubcategoryForm(category.id)}
                                        className={`text-xs text-gray-500 hover:text-${colorClass}-600 font-medium hover:bg-${colorClass}-100/50 px-2 py-1 rounded-lg transition-all duration-200 mt-1`}
                                      >
                                        + Crear subcategoría
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isFixed 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {isFixed ? '🏠 Fijo' : '🛒 Variable'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  category.is_essential 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {category.is_essential ? '⭐ Esencial' : '✨ No Esencial'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-gray-600 text-sm">
                                  ${(categoryBudgeted || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`font-bold text-sm ${
                                  percentage > 100 ? 'text-red-600' : 
                                  percentage > 80 ? 'text-yellow-600' : 
                                  'text-green-600'
                                }`}>
                                  ${(categoryTotal || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col items-center gap-1">
                                  {/* Barra de progreso */}
                                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${
                                        percentage > 100 ? 'bg-red-500' : 
                                        percentage > 80 ? 'bg-yellow-500' : 
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                  </div>
                                  {/* Porcentaje y estado */}
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs font-medium ${
                                      percentage > 100 ? 'text-red-600' : 
                                      percentage > 80 ? 'text-yellow-600' : 
                                      'text-green-600'
                                    }`}>
                                      {percentage.toFixed(0)}%
                                    </span>
                                    {percentage > 100 && <span className="text-xs">⚠️</span>}
                                    {percentage >= 80 && percentage <= 100 && <span className="text-xs">⚡</span>}
                                    {percentage < 80 && <span className="text-xs">✅</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => setEditingCategory(category.id)}
                                    className="p-1 text-blue-600 hover:bg-blue-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                    title="Editar"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => deleteCategory(category.id)}
                                    className="p-1 text-red-600 hover:bg-red-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  {categorySubcategories.length > 0 && (
                                    <button
                                      onClick={() => toggleCategoryExpansion(category.id)}
                                      className="p-1 text-gray-600 hover:bg-gray-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                      title={isExpanded ? "Ocultar" : "Mostrar"}
                                    >
                                      {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Formulario para nueva subcategoría */}
                            {showSubcategoryForm === category.id && (
                              <tr>
                                <td colSpan={7} className="py-3 px-4">
                                  <div className={`backdrop-blur-md bg-gradient-to-r from-${colorClass}-50/60 to-${colorClass === 'red' ? 'rose' : 'amber'}-50/60 border border-${colorClass}-200/30 rounded-2xl p-3 shadow-lg`}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`w-1.5 h-1.5 rounded-full bg-${colorClass}-400`}></div>
                                      <h6 className={`text-sm font-medium text-${colorClass}-800`}>Nueva subcategoría para {category.name}</h6>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                      <input
                                        type="text"
                                        value={newSubcategoryData.name}
                                        onChange={(e) => setNewSubcategoryData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nombre"
                                        className={`px-2 py-1.5 backdrop-blur-sm bg-white/70 border border-${colorClass}-200/50 rounded-lg focus:ring-2 focus:ring-${colorClass}-500 text-xs transition-all`}
                                      />
                                      <input
                                        type="number"
                                        value={newSubcategoryData.amount}
                                        onChange={(e) => setNewSubcategoryData(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="Monto"
                                        className={`px-2 py-1.5 backdrop-blur-sm bg-white/70 border border-${colorClass}-200/50 rounded-lg focus:ring-2 focus:ring-${colorClass}-500 text-xs transition-all`}
                                      />
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => createSubcategory(category.id)}
                                          className={`flex-1 bg-gradient-to-r from-${colorClass}-600 to-${colorClass === 'red' ? 'rose' : 'amber'}-600 text-white px-2 py-1.5 rounded-lg hover:from-${colorClass}-700 hover:to-${colorClass === 'red' ? 'rose' : 'amber'}-700 transition-all duration-200 text-xs font-medium shadow-sm`}
                                        >
                                          Crear
                                        </button>
                                        <button
                                          onClick={resetSubcategoryForm}
                                          className={`px-2 py-1.5 text-${colorClass}-600 hover:bg-${colorClass}-100/50 rounded-lg transition-all duration-200`}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}

                            {/* Subcategorías expandidas */}
                            {isExpanded && categorySubcategories.map((subcategory, subIndex) => {
                              const subPercentage = subcategory.budgeted_amount > 0 
                                ? ((subcategory.actual_amount || 0) / subcategory.budgeted_amount) * 100 
                                : 0;
                              
                              return (
                              <tr key={subcategory.id || `expense-sub-${category.id}-${subIndex}`} className={`bg-gradient-to-r from-${colorClass}-50/20 to-${colorClass === 'red' ? 'rose' : 'amber'}-50/20 backdrop-blur-sm hover:from-${colorClass}-50/40 hover:to-${colorClass === 'red' ? 'rose' : 'amber'}-50/40 transition-all`}>
                                <td className="py-2 px-4 pl-8" colSpan={3}>
                                  <div 
                                    className={`backdrop-blur-md bg-white/50 border border-${colorClass}-200/30 rounded-lg p-2 shadow-sm cursor-pointer hover:bg-white/70 hover:border-${colorClass}-300/50 transition-all`}
                                    onClick={() => {
                                      setSelectedSubcategory({
                                        id: subcategory.id,
                                        name: subcategory.name || 'Sin nombre',
                                        categoryName: category.name || 'Sin categoría'
                                      });
                                      setShowTransactionList(true);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r from-${colorClass}-400 to-${colorClass === 'red' ? 'rose' : 'amber'}-400`}></div>
                                      <span className="text-sm text-gray-800 flex-1">{subcategory.name || 'Sin nombre'}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-4 text-right">
                                  <span className="text-gray-600 text-xs">
                                    ${(subcategory.budgeted_amount || 0).toLocaleString()}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className={`font-semibold text-sm ${
                                      subPercentage > 100 ? 'text-red-600' : 
                                      subPercentage > 80 ? 'text-yellow-600' : 
                                      'text-green-600'
                                    }`}>
                                      ${(subcategory.actual_amount || 0).toLocaleString()}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setSelectedSubcategory({
                                          id: subcategory.id,
                                          name: subcategory.name || 'Sin nombre',
                                          categoryName: category.name || 'Sin categoría'
                                        });
                                        setShowTransactionList(true);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline mt-1"
                                    >
                                      Ver transacciones
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2 px-4">
                                  <div className="flex flex-col items-center gap-1">
                                    {/* Barra de progreso */}
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all ${
                                          subPercentage > 100 ? 'bg-red-500' : 
                                          subPercentage > 80 ? 'bg-yellow-500' : 
                                          'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(subPercentage, 100)}%` }}
                                      ></div>
                                    </div>
                                    {/* Porcentaje */}
                                    <span className={`text-xs font-medium ${
                                      subPercentage > 100 ? 'text-red-600' : 
                                      subPercentage > 80 ? 'text-yellow-600' : 
                                      'text-green-600'
                                    }`}>
                                      {subPercentage.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 px-4">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => setEditingSubcategory(subcategory.id)}
                                      className="p-1 text-blue-600 hover:bg-blue-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                      title="Editar"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => deleteSubcategory(subcategory.id)}
                                      className="p-1 text-red-600 hover:bg-red-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección de Ahorros y Metas - Glassmorphism */}
            <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-white/30 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">🎯 Ahorros y Metas</h3>
                      <p className="text-purple-100 text-sm">
                        {categories.filter(c => c.category_type === 'savings' || (c.category_type === 'income' && c.name.toLowerCase().includes('ahorro'))).length} metas • ${totalSavings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewCategoryForm(showNewCategoryForm === 'savings' ? null : 'savings')}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Meta
                  </button>
                </div>
              </div>

              {/* Formulario para nueva meta */}
              {showNewCategoryForm === 'savings' && (
                <div className="bg-gradient-to-r from-purple-50/80 to-violet-50/80 backdrop-blur-sm px-6 py-4 border-b border-purple-100/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      value={newCategoryData.name}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre de la meta"
                      className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      value={newCategoryData.amount}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Monto mensual"
                      className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      value={newCategoryData.description}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción (opcional)"
                      className="px-3 py-2 backdrop-blur-sm bg-white/70 border border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => createNewCategory('savings')}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        Crear
                      </button>
                      <button
                        onClick={resetNewCategoryForm}
                        className="px-4 py-2 text-purple-600 hover:bg-purple-100/50 rounded-xl transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla de Ahorros con Glassmorphism */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm border-b border-gray-200/50">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">Meta</th>
                      <th className="text-right py-3 px-6 font-semibold text-gray-700">Presupuestado</th>
                      <th className="text-right py-3 px-6 font-semibold text-gray-700">Real</th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">Progreso</th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {categories
                      .filter(c => c.category_type === 'savings' || (c.category_type === 'income' && c.name.toLowerCase().includes('ahorro')))
                      .map((category, index) => {
                        const categorySubcategories = getCategorySubcategories(category.id);
                        const categoryTotal = getCategoryTotal(category);
                        const categoryBudgeted = getCategoryDisplayAmount(category);
                        const percentage = categoryBudgeted > 0 ? (categoryTotal / categoryBudgeted) * 100 : 0;
                        const isExpanded = expandedCategories.has(category.id);
                        
                        return (
                          <React.Fragment key={category.id || `savings-cat-${index}`}>
                            {/* Fila principal */}
                            <tr 
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button')) return;
                                setSelectedCategory(category);
                                setShowTransactionModal(true);
                              }}
                              className="hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-violet-50/30 transition-all duration-200 group cursor-pointer">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  {categorySubcategories.length > 0 ? (
                                    <button
                                      onClick={() => toggleCategoryExpansion(category.id)}
                                      className="p-1 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-100/50 transition-all duration-200"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4" />
                                      )}
                                    </button>
                                  ) : (
                                    <div className="w-5 h-5"></div>
                                  )}
                                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 shadow-sm"></div>
                                  <div className="flex-1">
                                    {editingCategory === category.id ? (
                                      <input
                                        type="text"
                                        value={editValues[`${category.id}_name`] || category.name}
                                        onChange={(e) => handleEditCategory(category.id, 'name', e.target.value)}
                                        className="font-medium text-gray-900 backdrop-blur-sm bg-white/70 border border-gray-300/50 rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500 transition-all"
                                        onBlur={() => saveCategory(category.id)}
                                        onKeyPress={(e) => e.key === 'Enter' && saveCategory(category.id)}
                                        autoFocus
                                      />
                                    ) : (
                                      <h4 className="font-semibold text-gray-900">{category.name || 'Sin nombre'}</h4>
                                    )}
                                    {category.description && (
                                      <p className="text-sm text-gray-500">{category.description}</p>
                                    )}
                                    {categorySubcategories.length > 0 && (
                                      <div className="px-2 py-1 bg-purple-100/60 backdrop-blur-sm rounded-lg inline-block mt-1">
                                        <p className="text-xs text-purple-700 font-medium">
                                          {categorySubcategories.length} submetas
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-right">
                                {editingCategory === category.id && isCategoryEditable(category) ? (
                                  <input
                                    type="number"
                                    value={editValues[`${category.id}_budgeted_amount`] || category.budgeted_amount}
                                    onChange={(e) => handleEditCategory(category.id, 'budgeted_amount', parseFloat(e.target.value) || 0)}
                                    className="text-right font-bold text-gray-600 backdrop-blur-sm bg-white/70 border border-gray-300/50 rounded-lg px-2 py-1 w-32 focus:ring-2 focus:ring-purple-500 transition-all"
                                    onBlur={() => saveCategory(category.id)}
                                    onKeyPress={(e) => e.key === 'Enter' && saveCategory(category.id)}
                                  />
                                ) : (
                                  <span className="text-lg font-bold text-gray-600">
                                    ${(categoryBudgeted || 0).toLocaleString()}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className={`text-lg font-bold ${
                                  percentage >= 100 ? 'text-purple-700' : 
                                  percentage >= 80 ? 'text-purple-600' : 
                                  'text-yellow-600'
                                }`}>
                                  ${(categoryTotal || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col items-center gap-2">
                                  {/* Barra de progreso */}
                                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${
                                        percentage >= 100 ? 'bg-purple-600' : 
                                        percentage >= 80 ? 'bg-purple-500' : 
                                        'bg-yellow-500'
                                      }`}
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                  </div>
                                  {/* Porcentaje y estado */}
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs font-medium ${
                                      percentage >= 100 ? 'text-purple-700' : 
                                      percentage >= 80 ? 'text-purple-600' : 
                                      'text-yellow-600'
                                    }`}>
                                      {percentage.toFixed(0)}%
                                    </span>
                                    {percentage >= 100 && <span className="text-xs">🎯</span>}
                                    {percentage >= 80 && percentage < 100 && <span className="text-xs">⚡</span>}
                                    {percentage < 80 && <span className="text-xs">📊</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  {editingCategory === category.id ? (
                                    <button
                                      onClick={() => saveCategory(category.id)}
                                      className="p-2 text-purple-600 hover:bg-purple-100/50 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm"
                                      title="Guardar"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setEditingCategory(category.id)}
                                      className="p-2 text-blue-600 hover:bg-blue-100/50 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm"
                                      title="Editar"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteCategory(category.id)}
                                    className="p-2 text-red-600 hover:bg-red-100/50 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  {categorySubcategories.length > 0 && (
                                    <button
                                      onClick={() => toggleCategoryExpansion(category.id)}
                                      className="p-2 text-gray-600 hover:bg-gray-100/50 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm"
                                      title={isExpanded ? "Ocultar" : "Mostrar"}
                                    >
                                      {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Subcategorías expandidas - Diseño Glassmorphism */}
                            {isExpanded && categorySubcategories.map((subcategory, subIndex) => {
                              const subPercentage = subcategory.budgeted_amount > 0 
                                ? ((subcategory.actual_amount || 0) / subcategory.budgeted_amount) * 100 
                                : 0;
                              
                              return (
                              <tr key={subcategory.id || `savings-sub-${category.id}-${subIndex}`} className="bg-gradient-to-r from-purple-50/20 to-violet-50/20 backdrop-blur-sm hover:from-purple-50/40 hover:to-violet-50/40 transition-all">
                                <td className="py-3 px-6 pl-16">
                                  <div 
                                    className="backdrop-blur-md bg-white/50 border border-purple-200/30 rounded-xl p-3 shadow-sm cursor-pointer hover:bg-white/70 hover:border-purple-300/50 transition-all"
                                    onClick={() => {
                                      setSelectedSubcategory({
                                        id: subcategory.id,
                                        name: subcategory.name || 'Sin nombre',
                                        categoryName: category.name || 'Sin categoría'
                                      });
                                      setShowTransactionList(true);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-violet-400"></div>
                                      <div className="flex-1">
                                        {editingSubcategory === subcategory.id ? (
                                          <input
                                            type="text"
                                            value={editSubcategoryValues[`${subcategory.id}_name`] || subcategory.name}
                                            onChange={(e) => handleEditSubcategory(subcategory.id, 'name', e.target.value)}
                                            className="font-medium text-gray-800 backdrop-blur-sm bg-white/70 border border-gray-300/50 rounded-lg px-2 py-1 text-sm w-full focus:ring-2 focus:ring-purple-500 transition-all"
                                            onBlur={() => saveSubcategory(subcategory.id)}
                                            onKeyPress={(e) => e.key === 'Enter' && saveSubcategory(subcategory.id)}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        ) : (
                                          <h5 className="font-medium text-gray-800 text-sm">{subcategory.name || 'Sin nombre'}</h5>
                                        )}
                                        {subcategory.description && (
                                          <p className="text-xs text-gray-500 mt-1">{subcategory.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-6 text-right">
                                  {editingSubcategory === subcategory.id ? (
                                    <input
                                      type="number"
                                      value={editSubcategoryValues[`${subcategory.id}_budgeted_amount`] || subcategory.budgeted_amount}
                                      onChange={(e) => handleEditSubcategory(subcategory.id, 'budgeted_amount', parseFloat(e.target.value) || 0)}
                                      className="text-right font-semibold text-gray-600 backdrop-blur-sm bg-white/70 border border-gray-300/50 rounded-lg px-2 py-1 w-28 focus:ring-2 focus:ring-purple-500 transition-all"
                                      onBlur={() => saveSubcategory(subcategory.id)}
                                      onKeyPress={(e) => e.key === 'Enter' && saveSubcategory(subcategory.id)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <span className="font-semibold text-gray-600">
                                      ${(subcategory.budgeted_amount || 0).toLocaleString()}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-6 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className={`font-semibold ${
                                      subPercentage >= 100 ? 'text-purple-700' : 
                                      subPercentage >= 80 ? 'text-purple-600' : 
                                      'text-yellow-600'
                                    }`}>
                                      ${(subcategory.actual_amount || 0).toLocaleString()}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSubcategory({
                                          id: subcategory.id,
                                          name: subcategory.name || 'Sin nombre',
                                          categoryName: category.name || 'Sin categoría'
                                        });
                                        setShowTransactionList(true);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline mt-1"
                                    >
                                      Ver transacciones
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex flex-col items-center gap-1">
                                    {/* Barra de progreso */}
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all ${
                                          subPercentage >= 100 ? 'bg-purple-600' : 
                                          subPercentage >= 80 ? 'bg-purple-500' : 
                                          'bg-yellow-500'
                                        }`}
                                        style={{ width: `${Math.min(subPercentage, 100)}%` }}
                                      ></div>
                                    </div>
                                    {/* Porcentaje */}
                                    <span className={`text-xs font-medium ${
                                      subPercentage >= 100 ? 'text-purple-700' : 
                                      subPercentage >= 80 ? 'text-purple-600' : 
                                      'text-yellow-600'
                                    }`}>
                                      {subPercentage.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {editingSubcategory === subcategory.id ? (
                                      <button
                                        onClick={() => saveSubcategory(subcategory.id)}
                                        className="p-1 text-purple-600 hover:bg-purple-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                        title="Guardar"
                                      >
                                        <Save className="w-3 h-3" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setEditingSubcategory(subcategory.id)}
                                        className="p-1 text-blue-600 hover:bg-blue-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                        title="Editar"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteSubcategory(subcategory.id)}
                                      className="p-1 text-red-600 hover:bg-red-100/50 backdrop-blur-sm rounded-lg transition-all duration-200"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Transacciones */}
      {selectedCategory && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            loadBudgetData();
            setShowTransactionModal(false);
            setSelectedCategory(null);
          }}
          budgetId={budgetId}
          preselectedCategory={{
            id: selectedCategory.id,
            name: selectedCategory.name,
            type: selectedCategory.category_type
          }}
        />
      )}

      {/* 🆕 Modal de Lista de Transacciones */}
      {selectedSubcategory && (
        <TransactionListModal
          isOpen={showTransactionList}
          onClose={() => {
            setShowTransactionList(false);
            setSelectedSubcategory(null);
          }}
          subcategoryId={selectedSubcategory.id}
          subcategoryName={selectedSubcategory.name}
          categoryName={selectedSubcategory.categoryName}
        />
      )}

      {/* 🆕 Modal de Reporte Financiero con IA */}
      <FinancialReportModal
        isOpen={showFinancialReport}
        onClose={() => setShowFinancialReport(false)}
        budgetId={budgetId}
      />

      {/* Botón flotante de Cashbeat IA */}
      <div id="tour-ai-button">
        <CashbeatFloatingButton
          onClick={() => setIsChatModalOpen(true)}
          hasNotifications={false}
          notificationCount={0}
        />
      </div>

      {/* Modal de Chat Avanzado */}
      <AdvancedChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        onProfileUpdate={loadBudgetData}
      />
    </div>
  );
} 