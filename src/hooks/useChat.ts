import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { ChatMessage } from '../types/chat';
import { generateMessageId, canSendMessage, getErrorMessage, getDefaultErrorMessage, scrollToElement } from '../lib/utils/chat-utils';

export interface UseChatOptions {
  apiEndpoint: string;
  welcomeMessage?: string;
  maxQuestions?: number;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  includeUserToken?: boolean;
  customRequestBody?: (message: string, history: ChatMessage[]) => Record<string, unknown>;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  loading: boolean;
  error: string;
  setError: (error: string) => void;
  progress: number;
  isCompleted: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (customContent?: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'timestamp'>) => ChatMessage;
  clearMessages: () => void;
  scrollToBottom: () => void;
}

/**
 * Custom hook for chat functionality
 * Handles message state, sending, loading, errors, and progress tracking
 */
export function useChat(options: UseChatOptions): UseChatReturn {
  const {
    apiEndpoint,
    welcomeMessage,
    maxQuestions,
    onComplete,
    onProgress,
    includeUserToken = true,
    customRequestBody
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToElement(messagesEndRef);
  }, [messages]);

  // Initialize with welcome message if provided
  useEffect(() => {
    if (welcomeMessage) {
      const welcomeMsg: ChatMessage = {
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, [welcomeMessage]);

  /**
   * Scrolls to the bottom of the messages container
   */
  const scrollToBottom = useCallback(() => {
    scrollToElement(messagesEndRef);
  }, []);

  /**
   * Adds a message to the chat history
   */
  const addMessage = useCallback((message: Omit<ChatMessage, 'timestamp'>): ChatMessage => {
    const newMessage: ChatMessage = {
      ...message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  /**
   * Clears all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setProgress(0);
    setIsCompleted(false);
  }, []);

  /**
   * Sends a message to the API
   */
  const sendMessage = useCallback(async (customContent?: string): Promise<void> => {
    const content = customContent || inputMessage;

    if (!canSendMessage(content, loading)) {
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      // Get user session if required
      let userToken: string | undefined;
      if (includeUserToken) {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('No hay sesión activa');
        }
        userToken = session.access_token;
      }

      // Prepare request body
      const requestBody = customRequestBody
        ? customRequestBody(userMessage.content, messages)
        : {
            message: userMessage.content,
            chatHistory: messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            ...(userToken && { userToken })
          };

      // Send request
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];

        // Update progress if configured
        if (maxQuestions) {
          const newProgress = Math.min(
            Math.floor(newMessages.filter(m => m.role === 'user').length),
            maxQuestions
          );
          setProgress(newProgress);
          onProgress?.(newProgress);

          // Check completion
          if (newProgress >= maxQuestions && !isCompleted) {
            setIsCompleted(true);
            setTimeout(() => {
              onComplete?.();
            }, 2000);
          }
        }

        return newMessages;
      });

    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error('Error sending message:', err);
      setError(errorMsg);

      // Add error message from assistant
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: getDefaultErrorMessage(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [inputMessage, loading, messages, apiEndpoint, maxQuestions, isCompleted, includeUserToken, customRequestBody, onComplete, onProgress]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    loading,
    error,
    setError,
    progress,
    isCompleted,
    messagesEndRef,
    sendMessage,
    addMessage,
    clearMessages,
    scrollToBottom
  };
}
