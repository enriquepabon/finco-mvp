'use client';

import { useRouter } from 'next/navigation';
import BaseChatInterface from './BaseChatInterface';
import { useChat } from '../../hooks/useChat';
import { formatCashbeatMessage } from '@/lib/utils/chat-utils';

interface ChatInterfaceProps {
  onComplete?: () => void;
  className?: string;
}

const MAX_QUESTIONS = 9;

const WELCOME_MESSAGE = '¡Hola! 👋 Soy Cashbeat IA, tu coach financiero personal. \n\nTe haré exactamente **9 preguntas básicas** para conocer tu perfil financiero y que puedas empezar a crear tu presupuesto. Será rápido y enfocado.\n\n¿Cómo te llamas?';

export default function ChatInterface({ onComplete, className = '' }: ChatInterfaceProps) {
  const router = useRouter();

  const {
    messages,
    inputMessage,
    setInputMessage,
    loading,
    error,
    progress,
    isCompleted,
    messagesEndRef,
    sendMessage
  } = useChat({
    apiEndpoint: '/api/chat',
    welcomeMessage: WELCOME_MESSAGE,
    maxQuestions: MAX_QUESTIONS,
    onComplete: () => {
      onComplete?.();
      router.push('/dashboard');
    },
    includeUserToken: true,
    customRequestBody: (message, history) => ({
      message,
      chatHistory: history.map(m => ({ role: m.role, content: m.content })),
      userToken: undefined // Will be added by useChat
    })
  });

  // Custom header with progress
  const header = (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-lg font-bold">
            F
          </div>
          <div>
            <h3 className="font-semibold">MentorIA</h3>
            <p className="text-sm text-blue-200">Tu coach financiero personal</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-blue-200">Progreso</p>
          <p className="text-sm font-semibold">{progress}/{MAX_QUESTIONS}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-blue-800 rounded-full h-2">
        <div
          className="bg-green-400 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${(progress / MAX_QUESTIONS) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Custom footer for completion message
  const footer = isCompleted ? (
    <div className="border-t border-green-200 p-4 bg-green-50">
      <div className="text-center">
        <div className="text-2xl mb-2">🎉</div>
        <h3 className="font-semibold text-green-800 mb-1">¡Perfil Básico Completado!</h3>
        <p className="text-sm text-green-600 mb-3">
          Perfecto, ya tienes tu perfil básico listo. Ahora puedes crear tu presupuesto personalizado.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Redirigiendo al dashboard...</span>
        </div>
      </div>
    </div>
  ) : undefined;

  // Custom assistant message renderer with Cashbeat branding
  const renderAssistantMessage = (message: { content: string; timestamp: Date }) => (
    <div className="flex justify-start">
      <div className="max-w-[85%] lg:max-w-[80%] rounded-lg bg-white border border-gray-200 p-4 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="/Logo/cashbeat (11).png"
                alt="Cashbeat IA"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="font-semibold text-green-700 text-sm">Cashbeat IA</span>
          </div>
          <div
            className="text-gray-800 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatCashbeatMessage(message.content)
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseChatInterface
      messages={messages}
      inputMessage={inputMessage}
      onInputChange={setInputMessage}
      onSendMessage={() => sendMessage()}
      loading={loading}
      error={error}
      messagesEndRef={messagesEndRef}
      header={header}
      footer={footer}
      renderAssistantMessage={renderAssistantMessage}
      inputPlaceholder="Escribe tu mensaje..."
      className={className}
      messagesClassName="max-h-96"
    />
  );
}
