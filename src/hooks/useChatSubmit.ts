import { useCallback } from 'react';

export interface UseChatSubmitOptions {
  onSubmit: (message: string) => void | Promise<void>;
  disabled?: boolean;
}

export interface UseChatSubmitReturn {
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleSubmit: (e: React.FormEvent, message: string) => void;
  canSubmit: (message: string) => boolean;
}

/**
 * Custom hook for handling chat message submission
 * Provides keyboard and form submission handlers
 */
export function useChatSubmit(options: UseChatSubmitOptions): UseChatSubmitReturn {
  const { onSubmit, disabled = false } = options;

  /**
   * Handles Enter key press to submit message
   * Allows Shift+Enter for new lines
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const message = target.value.trim();
        if (message) {
          onSubmit(message);
        }
      }
    }
  }, [onSubmit, disabled]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback((e: React.FormEvent, message: string) => {
    e.preventDefault();
    if (!disabled && message.trim()) {
      onSubmit(message);
    }
  }, [onSubmit, disabled]);

  /**
   * Checks if a message can be submitted
   */
  const canSubmit = useCallback((message: string) => {
    return !disabled && message.trim().length > 0;
  }, [disabled]);

  return {
    handleKeyPress,
    handleSubmit,
    canSubmit
  };
}
