/**
 * Tipos para el sistema de transacciones de FINCO
 * Fecha: Enero 2025
 */

export interface Transaction {
  id: string;
  budget_id: string;
  category_id: string | null;
  subcategory_id: string | null;
  user_id: string;
  description: string;
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
  amount: number;
  transaction_type: 'income' | 'expense';
  suggested_category_id?: string;
  suggested_category_name?: string;
  new_category_name?: string;
  new_category_type?: 'income' | 'fixed_expense' | 'variable_expense';
  confidence: number;
}

export interface CreateTransactionInput {
  budget_id: string;
  category_id?: string;
  subcategory_id?: string;
  description: string;
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
  amount?: number;
  transaction_type?: 'income' | 'expense';
  transaction_date?: string;
  category_id?: string;
  subcategory_id?: string;
  location?: string;
  notes?: string;
}

