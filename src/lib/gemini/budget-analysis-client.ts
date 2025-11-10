/**
 * Budget Analysis Client (migrated to OpenAI)
 *
 * This file now uses OpenAI instead of Gemini for budget analysis operations.
 *
 * @module gemini/budget-analysis-client (migrated to OpenAI)
 */

import { analyzeBudgetConversation } from '../openai/client';

// Tipos para el análisis
export interface BudgetAnalysisData {
  type: 'income' | 'fixed_expense' | 'variable_expense' | 'savings';
  title: string;
  entries: Array<{
    category: string;
    subcategory?: string;
    amount: number;
  }>;
  totalAmount: number;
}

export interface AnalysisContext {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Analiza una conversación de presupuesto y extrae datos estructurados usando OpenAI
 *
 * @param chatHistory - Historial de la conversación
 * @param userContext - Contexto del usuario
 * @returns Datos de presupuesto estructurados
 */
export async function analyzeBudget(
  chatHistory: ChatMessage[],
  userContext: { full_name?: string; email?: string }
): Promise<{
  success: boolean;
  data?: {
    ingresos: Array<{ nombre: string; monto: number }>;
    gastos_fijos: Array<{ nombre: string; monto: number }>;
    gastos_variables: Array<{ nombre: string; monto: number }>;
    ahorros: Array<{ nombre: string; monto: number }>;
  };
  error?: string;
}> {
  console.log('🔄 Using OpenAI for budget analysis (migrated from Gemini)');
  return analyzeBudgetConversation(chatHistory, userContext);
}
