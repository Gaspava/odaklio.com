"use client";

import { memo } from "react";
import MessageRenderer from "./MessageRenderer";
import { IconHelp } from "../icons/Icons";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  isLastMessage?: boolean;
  isMobile?: boolean;
  onDidntUnderstand?: () => void;
}

function ChatMessageInner({
  role,
  content,
  isStreaming,
  isLastMessage,
  isMobile,
  onDidntUnderstand,
}: ChatMessageProps) {
  const isUser = role === "user";
  const isAI = role === "assistant";
  const showDidntUnderstand = isAI && content && !isStreaming && onDidntUnderstand;

  return (
    <div className={`chat-message-row ${isUser ? "chat-message-user" : "chat-message-ai"}`}>
      {/* AI Avatar */}
      {isAI && (
        <div className="chat-avatar ai-avatar">
          <div className="chat-avatar-inner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="avatar-pulse" />
        </div>
      )}

      <div className={`chat-bubble-container ${isUser ? "user-bubble-container" : "ai-bubble-container"}`}>
        {/* Message Bubble */}
        <div className={`chat-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
          {isUser ? (
            <p className="user-message-text">{content}</p>
          ) : (
            <MessageRenderer content={content} isStreaming={isStreaming && isLastMessage} />
          )}
        </div>

        {/* "Didn't understand" button for AI messages */}
        {showDidntUnderstand && (
          <button
            onClick={onDidntUnderstand}
            className={`didnt-understand-btn ${isMobile ? "visible" : ""}`}
          >
            <IconHelp size={11} />
            <span>Anlamadim</span>
          </button>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="chat-avatar user-avatar">
          <span>U</span>
        </div>
      )}
    </div>
  );
}

const ChatMessage = memo(ChatMessageInner, (prev, next) => {
  return (
    prev.content === next.content &&
    prev.isStreaming === next.isStreaming &&
    prev.isLastMessage === next.isLastMessage
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
