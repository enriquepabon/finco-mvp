/**
 * Budget Client (migrated to OpenAI)
 *
 * This file now uses OpenAI instead of Gemini for budget-related AI operations.
 *
 * @module gemini/budget-client (migrated to OpenAI)
 */

import { sendBudgetConversationalMessage, analyzeBudgetConversation } from '../openai/client';
import { OnboardingData } from '../../src/types/onboarding';

// Tipos para el historial de chat
export interface ChatHistory {
  role: 'user' | 'assistant';
  content: string;
}

export interface BudgetMessageRequest {
  message: string;
  chatHistory?: ChatHistory;
  userProfile?: Partial<OnboardingData>;
}

/**
 * Envía un mensaje conversacional sobre presupuesto usando OpenAI
 *
 * @param message - Mensaje del usuario
 * @param userContext - Contexto del usuario (nombre, email)
 * @param chatHistory - Historial de conversación
 * @returns Respuesta de la IA
 */
export async function sendBudgetMessage(
  message: string,
  userContext: { full_name?: string; email?: string },
  chatHistory?: ChatHistory[]
): Promise<{
  message: string;
  success: boolean;
  error?: string;
}> {
  console.log('🔄 Using OpenAI for budget chat (migrated from Gemini)');
  return sendBudgetConversationalMessage(message, userContext, chatHistory);
}

/**
 * Analiza una conversación completa de presupuesto y extrae datos estructurados
 *
 * @param chatHistory - Historial completo de la conversación
 * @param userContext - Contexto del usuario
 * @returns Datos estructurados en formato JSON
 */
export async function analyzeBudget(
  chatHistory: ChatHistory[],
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
