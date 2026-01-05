"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Lightbulb,
  Code,
  Settings,
  HelpCircle,
  Zap,
  RefreshCw,
  Copy,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  codeBlock?: { language: string; code: string };
  action?: { label: string; href: string };
}

const QUICK_PROMPTS = [
  {
    icon: Lightbulb,
    label: "Help me choose a template",
    prompt: "What template should I use for my project?",
  },
  {
    icon: Code,
    label: "Explain integrations",
    prompt: "What integrations are available and which should I use?",
  },
  {
    icon: Settings,
    label: "Configure for SaaS",
    prompt: "What's the best configuration for a SaaS app with auth and payments?",
  },
  {
    icon: HelpCircle,
    label: "Get started",
    prompt: "How do I get started with the framework?",
  },
];

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "👋 Hi! I'm your AI assistant for the Dawson Does Framework. I can help you:\n\n• **Choose the right template** for your project\n• **Configure integrations** like auth, payments, and analytics\n• **Explain features** and best practices\n• **Troubleshoot issues** with your exports\n\nWhat would you like help with?",
  timestamp: new Date(),
  suggestions: [
    "Help me choose a template",
    "What integrations do I need for a SaaS?",
    "How do I connect Supabase?",
  ],
};

// Simulated responses
const RESPONSES: Record<string, Message> = {
  "template": {
    id: "",
    role: "assistant",
    content: "Great question! Here are the templates available:\n\n🏢 **SaaS** - Best for subscription-based apps, dashboards, and B2B products. Includes auth flows, billing integration, and admin panels.\n\n🛒 **E-commerce** - Perfect for online stores. Comes with cart, checkout, product pages, and order management.\n\n📝 **Blog** - Ideal for content sites. Features post management, categories, and SEO optimization.\n\n📊 **Dashboard** - Great for internal tools. Includes data tables, charts, and analytics widgets.\n\nBased on your needs, which sounds closest to what you're building?",
    timestamp: new Date(),
    suggestions: ["I'm building a SaaS", "I need an online store", "I want a blog"],
  },
  "saas": {
    id: "",
    role: "assistant",
    content: "For a SaaS app, I recommend this configuration:\n\n**Essential integrations:**\n• 🔐 **Auth**: Supabase Auth or Clerk\n• 💳 **Payments**: Stripe\n• 📧 **Email**: Resend\n• 📊 **Analytics**: PostHog\n\n**Nice to have:**\n• 🔍 **Search**: Algolia\n• 🛡️ **Monitoring**: Sentry\n• 🖼️ **Images**: Cloudinary\n\nWant me to create this configuration for you?",
    timestamp: new Date(),
    codeBlock: {
      language: "bash",
      code: "npx @jrdaws/framework clone swift-eagle-1234",
    },
    action: {
      label: "Start Configuring",
      href: "/configure?template=saas",
    },
  },
  "supabase": {
    id: "",
    role: "assistant",
    content: "Connecting Supabase is easy! Here's how:\n\n**Step 1:** Create a Supabase project at supabase.com\n\n**Step 2:** Get your credentials from Settings → API:\n• Project URL\n• Anon Key\n• Service Role Key\n\n**Step 3:** Add them to your `.env.local`:\n\n```env\nNEXT_PUBLIC_SUPABASE_URL=your-url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-key\nSUPABASE_SERVICE_ROLE_KEY=your-secret\n```\n\n**Step 4:** Run the schema migration from your dashboard.\n\nNeed help with any of these steps?",
    timestamp: new Date(),
    action: {
      label: "Go to Services",
      href: "/dashboard/services",
    },
  },
};

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Determine response based on keywords
    let response: Message;
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("template") || lowerContent.includes("choose")) {
      response = { ...RESPONSES.template, id: `msg-${Date.now() + 1}`, timestamp: new Date() };
    } else if (lowerContent.includes("saas") || lowerContent.includes("subscription") || lowerContent.includes("configuration")) {
      response = { ...RESPONSES.saas, id: `msg-${Date.now() + 1}`, timestamp: new Date() };
    } else if (lowerContent.includes("supabase") || lowerContent.includes("connect")) {
      response = { ...RESPONSES.supabase, id: `msg-${Date.now() + 1}`, timestamp: new Date() };
    } else {
      response = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "I understand you're asking about: **" + content + "**\n\nLet me help you with that. Could you tell me more about what you're trying to build? That way I can give you more specific guidance.\n\nFor example:\n• What type of app is it? (SaaS, e-commerce, blog, etc.)\n• What features do you need? (auth, payments, AI, etc.)\n• Any specific integrations you're considering?",
        timestamp: new Date(),
        suggestions: ["I'm building a SaaS", "I need e-commerce", "Help with auth"],
      };
    }

    setMessages((prev) => [...prev, response]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bot className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to use the AI Assistant</h2>
          <p className="text-muted-foreground">Get personalized help with your projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Powered by Claude · Get help with your projects
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={clearChat} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Clear Chat
        </Button>
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {QUICK_PROMPTS.map((prompt) => (
            <Button
              key={prompt.label}
              variant="outline"
              className="h-auto py-3 px-4 flex flex-col items-start gap-2"
              onClick={() => sendMessage(prompt.prompt)}
            >
              <prompt.icon className="w-4 h-4 text-primary" />
              <span className="text-sm">{prompt.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.role === "assistant"
                      ? "bg-gradient-to-br from-primary to-primary/60"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`flex-1 ${
                    message.role === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground max-w-[80%]"
                        : "bg-muted max-w-full"
                    }`}
                  >
                    <div
                      className={`prose prose-sm max-w-none ${
                        message.role === "user"
                          ? "prose-invert"
                          : "prose-gray dark:prose-invert"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\n/g, "<br />"),
                      }}
                    />
                  </div>

                  {/* Code Block */}
                  {message.codeBlock && (
                    <div className="mt-3 text-left">
                      <div className="bg-slate-900 rounded-lg overflow-hidden max-w-lg">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
                          <span className="text-xs text-slate-400">
                            {message.codeBlock.language}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-slate-400 hover:text-white"
                            onClick={() => copyCode(message.codeBlock!.code, message.id)}
                          >
                            {copiedId === message.id ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
                          <code>{message.codeBlock.code}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {message.action && (
                    <div className="mt-3 text-left">
                      <Link href={message.action.href}>
                        <Button size="sm" className="gap-2">
                          {message.action.label}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => sendMessage(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about the framework..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI responses are generated and may not always be accurate. Always verify important information.
          </p>
        </div>
      </Card>
    </div>
  );
}

