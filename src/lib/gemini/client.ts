/**
 * OpenAI Client (formerly Gemini)
 *
 * This file now acts as a facade/wrapper for the OpenAI client.
 * All Gemini functionality has been migrated to OpenAI GPT-4o-mini.
 *
 * @module gemini/client (migrated to OpenAI)
 */

import { 
  sendMessageToOpenAI, 
  sendOnboardingMessage as openaiOnboarding,
  ChatMessage as OpenAIChatMessage,
  ChatResponse as OpenAIChatResponse
} from '../openai/client';
import { OnboardingData } from '../../src/types/onboarding';

/**
 * Re-export types for backwards compatibility
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  message: string;
  success: boolean;
  error?: string;
}

/**
 * Sends a message to OpenAI (formerly Gemini).
 *
 * @param {string} message - User's message
 * @param {string} [context] - Optional system context/instructions
 * @param {ChatMessage[]} [chatHistory] - Optional conversation history
 * @returns {Promise<ChatResponse>} AI response
 */
export async function sendMessageToGemini(
  message: string,
  context?: string,
  chatHistory?: ChatMessage[]
): Promise<ChatResponse> {
  console.log('🔄 Using OpenAI (migrated from Gemini)');
  return sendMessageToOpenAI(message, context, chatHistory);
}

/**
 * Specialized function for financial onboarding conversations using OpenAI.
 *
 * @param {string} message - User's onboarding response
 * @param {Partial<OnboardingData> | {full_name?: string; email?: string}} userProfile - Current user profile data
 * @param {ChatMessage[]} [chatHistory] - Conversation history
 * @returns {Promise<ChatResponse>} AI response following onboarding rules
 */
export async function sendOnboardingMessage(
  message: string,
  userProfile: Partial<OnboardingData> | { full_name?: string; email?: string },
  chatHistory?: ChatMessage[]
): Promise<ChatResponse> {
  console.log('🔄 Using OpenAI for onboarding (migrated from Gemini)');
  return openaiOnboarding(message, userProfile, chatHistory);
}
