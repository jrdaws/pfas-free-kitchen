"use client";

import { useState, useRef, useEffect } from "react";
import { useClaude } from "@/hooks/useClaude";
import { ClaudeMessage } from "./ClaudeMessage";
import { Send, Loader2, RefreshCw, Sparkles } from "lucide-react";

interface ClaudeChatProps {
  systemPrompt?: string;
  placeholder?: string;
  className?: string;
}

export function ClaudeChat({
  systemPrompt,
  placeholder = "Ask Claude anything...",
  className = "",
}: ClaudeChatProps) {
  const { messages, input, setInput, sendMessage, isLoading, clear } = useClaude({
    systemPrompt,
  });
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold">Claude AI</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Start a conversation</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Ask Claude anything. I can help with writing, analysis, coding, and more.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <ClaudeMessage
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Claude is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border p-4"
      >
        <div
          className={`flex items-end gap-2 rounded-lg border transition-colors ${
            isFocused ? "border-primary" : "border-border"
          } bg-muted/50 p-2`}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground"
            style={{ minHeight: "24px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Claude can make mistakes. Consider checking important information.
        </p>
      </form>
    </div>
  );
}

