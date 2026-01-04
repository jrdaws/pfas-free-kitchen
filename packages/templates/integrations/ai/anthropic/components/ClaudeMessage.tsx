"use client";

import { User, Sparkles } from "lucide-react";

interface ClaudeMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ClaudeMessage({ role, content }: ClaudeMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-orange-400 to-amber-600 text-white"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      {/* Message */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}

