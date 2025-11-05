/**
 * Chat Utility Functions
 * Shared utility functions for chat interfaces to eliminate duplication
 */

/**
 * Formats a Cashbeat message with rich styling
 * @param content - The message content to format
 * @returns HTML string with formatted content
 */
export const formatCashbeatMessage = (content: string): string => {
  return content
    // Convert questions to bold
    .replace(/([¿?][^¿?]*[¿?])/g, '<strong class="text-blue-700 block mt-3 mb-2">$1</strong>')
    // Convert "Sabías que" (fun facts) to highlighted blocks
    .replace(
      /(¿Sabías que[^.]*\.)/g,
      '<div class="bg-yellow-50 border-l-4 border-yellow-400 p-2 my-2 text-yellow-800"><em>💡 $1</em></div>'
    )
    // Convert quotes to highlighted blocks
    .replace(
      /(Como decía [^:]*: "[^"]*")/g,
      '<div class="bg-blue-50 border-l-4 border-blue-400 p-2 my-2 text-blue-800"><em>📚 $1</em></div>'
    )
    // Convert emojis at the start to badges
    .replace(
      /^([🎯🤖💰📊💪🔥]+)\s/gm,
      '<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2 mb-1">$1</span>'
    )
    // Line breaks
    .replace(/\n/g, '<br>');
};

/**
 * Formats a timestamp to HH:MM format
 * @param date - The date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Scrolls to a ref element smoothly
 * @param ref - React ref to scroll to
 */
export const scrollToElement = (ref: React.RefObject<HTMLElement | null>): void => {
  ref.current?.scrollIntoView({ behavior: 'smooth' });
};

/**
 * Generates a unique message ID
 * @returns Unique message ID string
 */
export const generateMessageId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Validates if a message is ready to be sent
 * @param message - The message content
 * @param loading - Whether a request is in progress
 * @returns True if message can be sent
 */
export const canSendMessage = (message: string, loading: boolean): boolean => {
  return message.trim().length > 0 && !loading;
};

/**
 * Extracts error message from various error types
 * @param error - The error object
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ha ocurrido un error inesperado';
};

/**
 * Creates a default error response message
 * @returns Error message content
 */
export const getDefaultErrorMessage = (): string => {
  return 'Lo siento, tuve un problema técnico. ¿Podrías intentar enviar tu mensaje de nuevo?';
};
