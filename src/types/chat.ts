/**
 * Chat-related TypeScript interfaces and types
 *
 * Used across chat components, API routes, and Gemini AI integration
 */

/**
 * Chat message role
 */
export type ChatRole = 'user' | 'assistant' | 'system';

/**
 * Individual chat message
 */
export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Chat history (array of messages)
 */
export type ChatHistory = ChatMessage[];

/**
 * API response for chat endpoints
 */
export interface ChatResponse {
  success: boolean;
  message: string;
  error?: string;
  debug?: {
    questionNumber?: number;
    onboardingCompleted?: boolean;
    profileExists?: boolean;
    userMessages?: number;
    totalMessages?: number;
    [key: string]: any;
  };
}

/**
 * Chat request payload
 */
export interface ChatRequest {
  message: string;
  chatHistory?: ChatHistory;
  attachments?: string[];
}

/**
 * Chat interface props (for React components)
 */
export interface ChatInterfaceProps {
  initialMessages?: ChatHistory;
  onMessageSent?: (message: string) => void;
  onError?: (error: Error) => void;
  placeholder?: string;
  disabled?: boolean;
  showVoiceRecorder?: boolean;
}

/**
 * Chat state (for useState/useReducer)
 */
export interface ChatState {
  messages: ChatHistory;
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
}

/**
 * Voice recorder state
 */
export interface VoiceRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  transcription: string | null;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Gemini AI configuration
 */
export interface GeminiConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

/**
 * Chat context for specialized interfaces
 */
export interface ChatContext {
  userId: string;
  sessionId?: string;
  context?: string;
  metadata?: Record<string, any>;
}
