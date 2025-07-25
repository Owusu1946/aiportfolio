'use client';

import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import { motion } from 'framer-motion';
import ChatMessageContent from './chat-message-content';
import ToolRenderer from './tool-renderer';
import { useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parts?: any[];
  toolName?: string;
  toolResult?: string;
}

interface SimplifiedChatViewProps {
  message: Message;
  isLoading: boolean;
  reload: () => Promise<string | null | undefined>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
}

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

export function SimplifiedChatView({
  message,
  isLoading,
  reload,
  addToolResult,
}: SimplifiedChatViewProps) {
  if (message.role !== 'assistant') return null;

  // Check if we have tool results from our custom implementation
  const hasToolResult = message.toolName && message.toolResult;
  const hasTextContent = message.content.trim().length > 0;
  
  // Log the message and tool information for debugging
  useEffect(() => {
    console.log('Message in SimplifiedChatView:', message);
    if (hasToolResult) {
      console.log('Tool detected:', message.toolName);
    } else {
      console.log('No tool detected in message. Tool info:', { 
        toolName: message.toolName, 
        toolResult: message.toolResult,
        hasToolName: Boolean(message.toolName),
        hasToolResult: Boolean(message.toolResult)
      });
    }
  }, [message, hasToolResult, message.toolName, message.toolResult]);

  return (
    <motion.div {...MOTION_CONFIG} className="flex h-full w-full flex-col px-4">
      {/* Single scrollable container for content */}
      <div className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto">
        {/* Tool result - displayed at the top if available */}
        {hasToolResult && (
          <div className="mb-4 w-full">
            <ToolRenderer
              toolName={message.toolName!}
              toolResult={message.toolResult!}
              messageId={message.id}
            />
          </div>
        )}

        {/* Text content */}
        {hasTextContent && (
          <div className="w-full">
            <ChatBubble variant="received" className="w-full">
              <ChatBubbleMessage className="w-full">
                <ChatMessageContent
                  message={message}
                  isLast={true}
                  isLoading={isLoading}
                  reload={reload}
                  addToolResult={addToolResult}
                  skipToolRendering={true}
                />
              </ChatBubbleMessage>
            </ChatBubble>
          </div>
        )}

        {/* Add some padding at the bottom for better scrolling experience */}
        <div className="pb-4"></div>
      </div>
    </motion.div>
  );
}
