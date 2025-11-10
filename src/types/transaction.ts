/**
 * Tipos para el sistema de transacciones de MentorIA
 * Fecha: Enero 2025
 */

export interface Transaction {
  id: string;
  budget_id: string;
  category_id: string | null;
  subcategory_id: string | null;
  user_id: string;
  description: string;
  detail?: string; // 🆕 Detalle específico adicional
  amount: number;
  transaction_type: 'income' | 'expense';
  transaction_date: string;
  location?: string;
  notes?: string;
  auto_categorized: boolean;
  confidence_score?: number;
  created_at: string;
  updated_at: string;
}

export interface VoiceTransactionParsed {
  description: string;
  detail?: string; // 🆕 Detalle específico editable
  amount: number;
  transaction_type: 'income' | 'expense';
  suggested_category_id?: string | null;
  suggested_subcategory_id?: string | null;  // 🆕 ID de subcategoría mapeada
  suggested_category_name?: string | null;
  suggested_subcategory_name?: string | null; // 🆕 Nombre de subcategoría sugerida
  new_category_name?: string | null;
  new_category_type?: 'income' | 'expense' | 'savings'; // 🆕 Actualizado: income, expense, savings
  expense_type?: 'fixed' | 'variable'; // 🆕 Tipo de gasto (solo para expenses)
  is_essential?: boolean; // 🆕 Esencial o no (solo para expenses)
  confidence: number;
  requires_user_confirmation?: boolean; // 🆕 Flag si requiere confirmación
}

export interface CreateTransactionInput {
  budget_id: string;
  category_id?: string;
  subcategory_id?: string;
  description: string;
  detail?: string; // 🆕 Detalle específico adicional
  amount: number;
  transaction_type: 'income' | 'expense';
  transaction_date?: string;
  location?: string;
  notes?: string;
  auto_categorized?: boolean;
  confidence_score?: number;
}

export interface UpdateTransactionInput {
  description?: string;
  detail?: string; // 🆕 Detalle específico adicional
  amount?: number;
  transaction_type?: 'income' | 'expense';
  transaction_date?: string;
  category_id?: string;
  subcategory_id?: string;
  location?: string;
  notes?: string;
}

