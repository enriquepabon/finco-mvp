import { useState, useCallback } from 'react';
import { ChatMessage } from '../types/chat';

export interface UseChatHistoryReturn {
  history: ChatMessage[];
  addToHistory: (message: ChatMessage) => void;
  clearHistory: () => void;
  getFormattedHistory: () => Array<{ role: string; content: string }>;
  getHistoryLength: () => number;
  getLastMessage: () => ChatMessage | null;
}

/**
 * Custom hook for managing chat history
 * Provides utilities for storing and retrieving chat message history
 */
export function useChatHistory(): UseChatHistoryReturn {
  const [history, setHistory] = useState<ChatMessage[]>([]);

  /**
   * Adds a message to the chat history
   */
  const addToHistory = useCallback((message: ChatMessage) => {
    setHistory(prev => [...prev, message]);
  }, []);

  /**
   * Clears all chat history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  /**
   * Returns chat history formatted for API requests
   * Strips unnecessary fields and returns only role and content
   */
  const getFormattedHistory = useCallback(() => {
    return history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }, [history]);

  /**
   * Returns the total number of messages in history
   */
  const getHistoryLength = useCallback(() => {
    return history.length;
  }, [history]);

  /**
   * Returns the last message in history, or null if empty
   */
  const getLastMessage = useCallback(() => {
    if (history.length === 0) return null;
    return history[history.length - 1];
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    getFormattedHistory,
    getHistoryLength,
    getLastMessage
  };
}
