import { useState, useCallback, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parts?: any[];
  toolName?: string;
  toolResult?: string;
}

interface UseGeminiChatOptions {
  onResponse?: (response: any) => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
  onToolCall?: (tool: any) => void;
}

interface ApiResponse {
  content: string;
  toolUsed: boolean;
  toolName: string;
  toolResult: string;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

export function useGeminiChat(options: UseGeminiChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const append = useCallback(async (message: Omit<Message, 'id'>) => {
    const messageWithId = { ...message, id: generateId() };
    setMessages((current) => [...current, messageWithId]);
    
    if (message.role === 'user') {
      setIsLoading(true);
      console.log('Sending message to API:', message.content);
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, messageWithId],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        if (options.onResponse) {
          options.onResponse(response);
        }

        const responseData: ApiResponse = await response.json();
        console.log('API response:', responseData);
        
        // Create assistant message with tool information if applicable
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: responseData.content,
        };
        
        // Add tool information if a tool was used
        if (responseData.toolUsed && responseData.toolName) {
          console.log(`Tool used: ${responseData.toolName}`);
          console.log(`Tool result: ${responseData.toolResult}`);
          assistantMessage.toolName = responseData.toolName;
          assistantMessage.toolResult = responseData.toolResult;
          
          // Notify about tool call if callback is provided
          if (options.onToolCall) {
            console.log('Calling onToolCall with:', {
              toolName: responseData.toolName,
              toolResult: responseData.toolResult
            });
            options.onToolCall({
              toolCall: {
                toolName: responseData.toolName,
                toolResult: responseData.toolResult
              }
            });
          } else {
            console.log('No onToolCall callback provided');
          }
        } else {
          console.log('No tool used in this response. Response data:', responseData);
        }
        
        console.log('Adding assistant message:', assistantMessage);
        setMessages((current) => [...current, assistantMessage]);

        if (options.onFinish) {
          options.onFinish();
        }
      } catch (err) {
        console.error('Error in API call:', err);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        if (options.onError) {
          options.onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [messages, options]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    append({
      role: 'user',
      content: input,
    });
    
    setInput('');
  }, [append, input]);

  const stop = useCallback(() => {
    // In a non-streaming implementation, this is a no-op
    // but we keep it for API compatibility
    setIsLoading(false);
  }, []);

  const reload = useCallback(() => {
    // Reload the last message
    if (messages.length > 0) {
      const lastUserMessageIndex = messages.findLastIndex(m => m.role === 'user');
      if (lastUserMessageIndex >= 0) {
        const lastUserMessage = messages[lastUserMessageIndex];
        console.log('Reloading with last user message:', lastUserMessage);
        // Remove the last assistant message
        setMessages(messages => messages.filter((_, i) => i !== messages.length - 1));
        // Re-send the last user message
        append({
          role: lastUserMessage.role,
          content: lastUserMessage.content,
          parts: lastUserMessage.parts,
        });
      }
    }
    return Promise.resolve(null);
  }, [messages, append]);

  // These are stubs to maintain API compatibility with the original useChat hook
  const addToolResult = useCallback(() => {
    // No-op in our implementation
    return Promise.resolve();
  }, []);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
    addToolResult,
    append,
    error,
  };
} 