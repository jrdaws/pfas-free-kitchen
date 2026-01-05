"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TEMPLATE_PROMPTS } from "./types";
import { Lightbulb, ChevronDown, ChevronUp, Mic, MicOff } from "lucide-react";

interface ProblemStepProps {
  value: string;
  onChange: (value: string) => void;
  template?: string;
  className?: string;
}

export function ProblemStep({ value, onChange, template, className }: ProblemStepProps) {
  const [showExamples, setShowExamples] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const prompts = TEMPLATE_PROMPTS[template || "default"] || TEMPLATE_PROMPTS.default;

  const handleExampleClick = (example: string) => {
    onChange(example);
    setShowExamples(false);
  };

  // Voice input using Web Speech API
  const toggleVoiceInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;

    if (!win.webkitSpeechRecognition && !win.SpeechRecognition) {
      alert("Voice input is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionClass = win.webkitSpeechRecognition || win.SpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(value ? `${value} ${transcript}` : transcript);
    };

    recognition.start();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Question */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {prompts.problemPrompt}
        </h3>
        <p className="text-sm text-muted-foreground">
          Be specific about who you're helping and what pain point you're solving.
        </p>
      </div>

      {/* Input */}
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={prompts.problemPlaceholder}
          rows={4}
          className="pr-12 resize-none"
        />
        <Button
          type="button"
          size="icon"
          variant={isRecording ? "default" : "ghost"}
          className={cn(
            "absolute right-2 top-2",
            isRecording && "bg-red-500 hover:bg-red-600 text-white"
          )}
          onClick={toggleVoiceInput}
          title="Voice input"
        >
          {isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Examples Toggle */}
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowExamples(!showExamples)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Lightbulb className="w-4 h-4" />
          Need inspiration?
          {showExamples ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {showExamples && (
          <div className="mt-3 space-y-2">
            {prompts.problemExamples.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleExampleClick(example)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border border-border",
                  "bg-muted/30 hover:bg-muted/50 transition-colors",
                  "text-sm text-foreground"
                )}
              >
                "{example}"
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Character count */}
      <p className="text-xs text-muted-foreground text-right">
        {value.length} characters
        {value.length > 0 && value.length < 20 && (
          <span className="text-amber-500 ml-2">← Add more detail for better results</span>
        )}
      </p>
    </div>
  );
}

export default ProblemStep;

