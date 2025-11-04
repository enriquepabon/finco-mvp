/**
 * Onboarding-related TypeScript interfaces and types
 *
 * Used in onboarding flow, parsers, and user profile creation
 */

/**
 * Civil status options
 */
export type CivilStatus = 'soltero' | 'casado' | 'union_libre' | 'divorciado' | 'viudo';

/**
 * Complete onboarding data structure
 * Matches the user_profiles table schema
 */
export interface OnboardingData {
  // Identity
  user_id: string;
  full_name?: string;
  email?: string;
  age?: number;
  civil_status?: CivilStatus;
  children_count?: number;

  // Financial data
  monthly_income?: number;
  monthly_expenses?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_savings?: number;

  // Calculated fields
  net_worth?: number;
  savings_capacity?: number;
  debt_ratio?: number;
  emergency_fund_months?: number;

  // Status
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Parsed onboarding data (subset for parser output)
 * All fields optional as parser may extract partial data
 */
export interface ParsedOnboardingData {
  full_name?: string;
  age?: number;
  civil_status?: CivilStatus;
  children_count?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_savings?: number;
}

/**
 * Onboarding question structure
 */
export interface OnboardingQuestion {
  number: number;
  text: string;
  field: keyof ParsedOnboardingData;
  parser: (response: string) => any;
  validation?: (value: any) => boolean;
}

/**
 * Onboarding progress
 */
export interface OnboardingProgress {
  currentQuestion: number;
  totalQuestions: number;
  completedFields: (keyof ParsedOnboardingData)[];
  isComplete: boolean;
}

/**
 * Onboarding state (for React components)
 */
export interface OnboardingState {
  progress: OnboardingProgress;
  data: Partial<ParsedOnboardingData>;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  isLoading: boolean;
  error: string | null;
}

/**
 * User profile (database schema)
 */
export interface UserProfile extends OnboardingData {
  id: string;
  // Additional profile fields can be added here
}

/**
 * Profile update request
 */
export interface ProfileUpdateRequest {
  full_name?: string;
  age?: number;
  civil_status?: CivilStatus;
  children_count?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_savings?: number;
}

/**
 * Financial KPIs (calculated from profile data)
 */
export interface FinancialKPIs {
  netWorth: {
    value: number;
    label: string;
    status: 'positive' | 'neutral' | 'negative';
  };
  savingsCapacity: {
    value: number;
    percentage: number;
    label: string;
    status: 'good' | 'warning' | 'critical';
  };
  debtRatio: {
    value: number;
    percentage: number;
    label: string;
    status: 'healthy' | 'moderate' | 'high';
  };
  emergencyFund: {
    months: number;
    amount: number;
    label: string;
    status: 'sufficient' | 'insufficient' | 'none';
  };
}
