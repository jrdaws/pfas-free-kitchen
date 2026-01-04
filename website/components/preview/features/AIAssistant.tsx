"use client";

import { cn } from "@/lib/utils";
import { Bot, Send, Sparkles, User, Loader2 } from "lucide-react";

interface AIAssistantProps {
  provider?: string;
  variant?: "chat" | "fab" | "inline" | "widget";
  className?: string;
}

const AI_PROVIDERS: Record<string, { name: string; color: string; icon: string }> = {
  "openai": { name: "OpenAI", color: "#00A67E", icon: "🤖" },
  "anthropic": { name: "Anthropic", color: "#D97757", icon: "🧠" },
  "google": { name: "Google AI", color: "#4285F4", icon: "✨" },
};

/**
 * Preview component showing AI assistant/chatbot
 * Displays when AI features are selected
 */
export function AIAssistant({ 
  provider, 
  variant = "widget",
  className 
}: AIAssistantProps) {
  const providerInfo = provider ? AI_PROVIDERS[provider] : null;
  const accentColor = providerInfo?.color || "#F97316";

  const mockMessages = [
    { role: "user", content: "How do I create a new project?" },
    { role: "assistant", content: "To create a new project, click the 'New Project' button in your dashboard. You can choose from our templates or start from scratch." },
  ];

  if (variant === "fab") {
    return (
      <button 
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105",
          className
        )}
        style={{ backgroundColor: accentColor }}
      >
        <Bot className="h-6 w-6 text-white" />
        {providerInfo && (
          <span className="absolute -top-1 -right-1 text-xs">{providerInfo.icon}</span>
        )}
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-card border border-border", className)}>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Ask AI anything..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted outline-none"
          />
        </div>
        <button 
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  if (variant === "chat") {
    return (
      <div className={cn("bg-card border border-border rounded-xl overflow-hidden w-80", className)}>
        {/* Header */}
        <div 
          className="flex items-center gap-3 px-4 py-3"
          style={{ backgroundColor: `${accentColor}10` }}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-foreground text-sm">AI Assistant</div>
            <div className="text-xs text-foreground-muted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Online
            </div>
          </div>
          {providerInfo && (
            <span 
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${providerInfo.color}20`, color: providerInfo.color }}
            >
              {providerInfo.icon} {providerInfo.name}
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="p-4 space-y-4 h-64 overflow-y-auto">
          {mockMessages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}>
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "user" ? "bg-primary/20" : ""
                )}
                style={msg.role === "assistant" ? { backgroundColor: `${accentColor}20` } : undefined}
              >
                {msg.role === "user" ? (
                  <User className="h-3 w-3 text-primary" />
                ) : (
                  <Bot className="h-3 w-3" style={{ color: accentColor }} />
                )}
              </div>
              <div 
                className={cn(
                  "max-w-[80%] p-3 rounded-xl text-sm",
                  msg.role === "user" 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-background-alt text-foreground rounded-tl-none"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-background-alt rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted outline-none"
          />
          <button 
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Widget variant (default)
  return (
    <div className={cn("bg-card border border-border rounded-xl p-4", className)}>
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Sparkles className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        <div>
          <div className="font-semibold text-foreground">AI Powered</div>
          <div className="text-xs text-foreground-muted">
            {providerInfo ? `Using ${providerInfo.name}` : "Intelligent assistance"}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {["Generate content", "Analyze data", "Answer questions"].map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm text-foreground-secondary">
            <Sparkles className="h-3 w-3" style={{ color: accentColor }} />
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
}

