/**
 * Budget-related TypeScript interfaces and types
 *
 * Used in budget creation, management, and analysis
 */

/**
 * Category types
 */
export type CategoryType = 'income' | 'fixed_expense' | 'variable_expense';

/**
 * Transaction type
 */
export type TransactionType = 'income' | 'expense';

/**
 * Budget period
 */
export interface BudgetPeriod {
  month: number;  // 1-12
  year: number;   // YYYY
}

/**
 * Budget category (for creation and planning)
 */
export interface BudgetCategory {
  id?: string;
  name: string;
  type: CategoryType;
  amount: number;
  description?: string;
  icon?: string;
  color?: string;
  subcategories?: BudgetSubcategory[];
  isEssential?: boolean;
}

/**
 * Budget subcategory
 */
export interface BudgetSubcategory {
  id?: string;
  name: string;
  amount: number;
  description?: string;
  parentCategoryId?: string;
}

/**
 * Budget goals
 */
export interface BudgetGoals {
  savingsTarget: number;
  emergencyFund: number;
  debtReduction?: number;
  customGoals?: Array<{
    name: string;
    target: number;
    deadline?: string;
  }>;
}

/**
 * Complete budget structure (database schema)
 */
export interface Budget {
  id: string;
  user_id: string;
  month: number;
  year: number;

  // Totals
  total_income: number;
  total_fixed_expenses: number;
  total_variable_expenses: number;

  // Calculated
  net_balance: number;
  savings_target?: number;

  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations (populated)
  categories?: BudgetCategory[];
  transactions?: Transaction[];
}

/**
 * Category in database
 */
export interface Category {
  id: string;
  budget_id: string;
  name: string;
  category_type: CategoryType;
  planned_amount: number;
  actual_amount: number;
  description?: string;
  icon?: string;
  color?: string;
  is_essential: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Transaction in database
 */
export interface Transaction {
  id: string;
  user_id: string;
  budget_id?: string;
  category_id?: string;

  description: string;
  amount: number;
  transaction_type: TransactionType;
  transaction_date: string;

  // Metadata
  payment_method?: string;
  notes?: string;
  tags?: string[];

  // Voice transaction fields
  confidence_score?: number;
  was_voice_input: boolean;

  created_at: string;
  updated_at: string;

  // Relations (populated)
  category?: Category;
}

/**
 * Voice transaction parsed result
 */
export interface VoiceTransactionParsed {
  description: string;
  amount: number;
  transaction_type: TransactionType;
  confidence: number;

  // Category matching
  suggested_category_id?: string | null;
  suggested_category_name?: string | null;

  // New category suggestion
  new_category_name?: string | null;
  new_category_type?: CategoryType;
}

/**
 * Budget creation request
 */
export interface BudgetCreateRequest {
  month: number;
  year: number;
  categories: Omit<BudgetCategory, 'id'>[];
  goals?: BudgetGoals;
  duplicate_from_budget_id?: string;
}

/**
 * Budget update request
 */
export interface BudgetUpdateRequest {
  savings_target?: number;
  is_active?: boolean;
}

/**
 * Transaction create request
 */
export interface TransactionCreateRequest {
  description: string;
  amount: number;
  transaction_type: TransactionType;
  transaction_date: string;
  category_id?: string;
  budget_id?: string;
  payment_method?: string;
  notes?: string;
  tags?: string[];
  was_voice_input?: boolean;
  confidence_score?: number;
}

/**
 * Budget summary (analytics)
 */
export interface BudgetSummary {
  period: BudgetPeriod;
  totals: {
    income: number;
    fixedExpenses: number;
    variableExpenses: number;
    totalExpenses: number;
    netBalance: number;
    savingsRate: number;  // percentage
  };
  categoryBreakdown: Array<{
    name: string;
    type: CategoryType;
    planned: number;
    actual: number;
    variance: number;
    variancePercentage: number;
  }>;
  alerts: Array<{
    type: 'over_budget' | 'under_budget' | 'on_track';
    message: string;
    category?: string;
  }>;
}

/**
 * Budget comparison (month over month)
 */
export interface BudgetComparison {
  current: BudgetSummary;
  previous: BudgetSummary;
  changes: {
    incomeChange: number;
    expenseChange: number;
    savingsChange: number;
    percentChanges: {
      income: number;
      expenses: number;
      savings: number;
    };
  };
}

/**
 * Parsed budget response from AI
 */
export interface ParsedBudgetResponse {
  question: number;
  original: string;
  parsed: {
    period?: BudgetPeriod;
    categories?: BudgetCategory[];
    goals?: BudgetGoals;
    concepts?: string[];
    priorities?: string[];
    amount?: number;
    text?: string;
  };
  categoriesCreated?: BudgetCategory[];
  timestamp: string;
}
