'use client';

import { ReactNode } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { formatTime } from '../../lib/utils/chat-utils';
import { useChatSubmit } from '../../hooks/useChatSubmit';

export interface BaseChatInterfaceProps {
  messages: ChatMessage[];
  inputMessage: string;
  onInputChange: (message: string) => void;
  onSendMessage: () => void;
  loading: boolean;
  error?: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;

  // Customization props
  header?: ReactNode;
  footer?: ReactNode;
  messageFormatter?: (content: string) => string;
  renderUserMessage?: (message: ChatMessage) => ReactNode;
  renderAssistantMessage?: (message: ChatMessage) => ReactNode;
  renderLoadingIndicator?: () => ReactNode;
  inputPlaceholder?: string;
  sendButtonText?: string;
  showTimestamps?: boolean;
  className?: string;
  messagesClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
}

/**
 * Base Chat Interface Component
 * Provides a flexible, reusable chat UI with customizable rendering
 */
export default function BaseChatInterface({
  messages,
  inputMessage,
  onInputChange,
  onSendMessage,
  loading,
  error,
  messagesEndRef,
  header,
  footer,
  messageFormatter,
  renderUserMessage,
  renderAssistantMessage,
  renderLoadingIndicator,
  inputPlaceholder = 'Escribe tu mensaje...',
  sendButtonText,
  showTimestamps = true,
  className = '',
  messagesClassName = '',
  inputClassName = '',
  disabled = false
}: BaseChatInterfaceProps) {

  const { handleKeyPress, canSubmit } = useChatSubmit({
    onSubmit: onSendMessage,
    disabled: disabled || loading
  });

  // Default message renderers
  const defaultRenderUserMessage = (message: ChatMessage) => (
    <div className="flex justify-end">
      <div className="max-w-[85%] lg:max-w-[80%] rounded-lg bg-blue-600 text-white px-4 py-3 shadow-sm">
        {messageFormatter ? (
          <div dangerouslySetInnerHTML={{ __html: messageFormatter(message.content) }} />
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        {showTimestamps && (
          <p className="text-xs mt-2 opacity-70">{formatTime(message.timestamp)}</p>
        )}
      </div>
    </div>
  );

  const defaultRenderAssistantMessage = (message: ChatMessage) => (
    <div className="flex justify-start">
      <div className="max-w-[85%] lg:max-w-[80%] rounded-lg bg-white border border-gray-200 px-4 py-3 shadow-sm">
        {messageFormatter ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: messageFormatter(message.content) }}
          />
        ) : (
          <p className="whitespace-pre-wrap text-gray-800">{message.content}</p>
        )}
        {showTimestamps && (
          <p className="text-xs mt-2 text-gray-500">{formatTime(message.timestamp)}</p>
        )}
      </div>
    </div>
  );

  const defaultRenderLoadingIndicator = () => (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      {header && <div className="flex-shrink-0">{header}</div>}

      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${messagesClassName}`}>
        {messages.map((message, index) => (
          <div key={index}>
            {message.role === 'user'
              ? (renderUserMessage || defaultRenderUserMessage)(message)
              : (renderAssistantMessage || defaultRenderAssistantMessage)(message)
            }
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (renderLoadingIndicator || defaultRenderLoadingIndicator)()}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className={`border-t border-gray-200 p-4 flex-shrink-0 ${inputClassName}`}>
        <div className="flex space-x-2">
          <label htmlFor="chat-message-input" className="sr-only">
            Mensaje de chat
          </label>
          <input
            id="chat-message-input"
            type="text"
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={inputPlaceholder}
            disabled={disabled || loading}
            aria-label="Mensaje de chat"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={onSendMessage}
            disabled={!canSubmit(inputMessage) || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            aria-label="Enviar mensaje"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {sendButtonText && <span>{sendButtonText}</span>}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {sendButtonText && <span>{sendButtonText}</span>}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      {footer && <div className="flex-shrink-0">{footer}</div>}
    </div>
  );
}
