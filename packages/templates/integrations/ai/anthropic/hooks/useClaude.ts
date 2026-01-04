"use client";

import { useState, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseClaudeOptions {
  systemPrompt?: string;
  model?: string;
}

interface UseClaudeReturn {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  clear: () => void;
}

export function useClaude(options: UseClaudeOptions = {}): UseClaudeReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: Message = { role: "user", content };
      const newMessages = [...messages, userMessage];
      
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            system: options.systemPrompt,
            model: options.model,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response stream");
        }

        const decoder = new TextDecoder();
        let assistantContent = "";

        // Add placeholder assistant message
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantContent += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        // Remove the placeholder message on error
        setMessages(messages);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, options.systemPrompt, options.model]
  );

  const clear = useCallback(() => {
    setMessages([]);
    setInput("");
    setError(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    clear,
  };
}

