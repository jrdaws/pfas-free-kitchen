"use client";

import { Check, ExternalLink, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationProvider {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricingNote: string;
  docsUrl: string;
  signupUrl: string;
  difficulty: "Easy" | "Medium" | "Advanced";
}

const NOTIFICATION_PROVIDERS: NotificationProvider[] = [
  {
    id: "novu",
    name: "Novu",
    description: "Open-source notification infrastructure",
    features: ["Multi-channel", "In-app", "Templates", "Open source"],
    pricingNote: "Free: 10K events/mo, then $250/mo",
    docsUrl: "https://docs.novu.co",
    signupUrl: "https://web.novu.co/auth/signup",
    difficulty: "Easy",
  },
  {
    id: "onesignal",
    name: "OneSignal",
    description: "Multi-platform push notifications",
    features: ["Push", "In-app", "Email", "SMS"],
    pricingNote: "Free: unlimited push, paid for email/SMS",
    docsUrl: "https://documentation.onesignal.com",
    signupUrl: "https://onesignal.com/signup",
    difficulty: "Easy",
  },
  {
    id: "knock",
    name: "Knock",
    description: "Notification infrastructure as a service",
    features: ["Multi-channel", "Workflows", "Preferences", "In-app feed"],
    pricingNote: "Free: 10K notifications/mo, then $250/mo",
    docsUrl: "https://docs.knock.app",
    signupUrl: "https://dashboard.knock.app/signup",
    difficulty: "Easy",
  },
  {
    id: "firebase-fcm",
    name: "Firebase Cloud Messaging",
    description: "Google's push notification service",
    features: ["Free", "Cross-platform", "Topics", "Analytics"],
    pricingNote: "Free (part of Firebase)",
    docsUrl: "https://firebase.google.com/docs/cloud-messaging",
    signupUrl: "https://console.firebase.google.com",
    difficulty: "Medium",
  },
];

interface NotificationsSectionProps {
  selectedProvider?: string;
  onProviderChange: (providerId: string | undefined) => void;
}

export function NotificationsSection({
  selectedProvider,
  onProviderChange,
}: NotificationsSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/50">
          Choose notification service
        </p>
        {selectedProvider && (
          <button
            onClick={() => onProviderChange(undefined)}
            className="text-[10px] text-white/40 hover:text-white"
          >
            Skip
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {NOTIFICATION_PROVIDERS.map((provider) => {
          const isSelected = selectedProvider === provider.id;

          return (
            <button
              key={provider.id}
              onClick={() => onProviderChange(provider.id)}
              className={cn(
                "w-full text-left p-2 rounded-md border transition-all",
                isSelected
                  ? "bg-[var(--primary)]/15 border-[var(--primary)]/40"
                  : "bg-black/20 border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-2">
                <Bell className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isSelected ? "text-[var(--primary)]" : "text-white/50"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "font-medium text-xs",
                      isSelected ? "text-[var(--primary)]" : "text-white/90"
                    )}>
                      {provider.name}
                    </span>
                    <span className={cn(
                      "text-[9px] px-1 py-0.5 rounded",
                      provider.difficulty === "Easy" 
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    )}>
                      {provider.difficulty}
                    </span>
                    {isSelected && (
                      <Check className="h-3 w-3 text-[var(--primary)] shrink-0 ml-auto" />
                    )}
                  </div>
                  <p className="text-[10px] text-white/40 truncate">
                    {provider.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {provider.features.slice(0, 3).map((feature) => (
                      <span key={feature} className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <p className="text-[9px] text-white/40">{provider.pricingNote}</p>
                  <div className="flex gap-2">
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] text-[var(--primary)] hover:underline flex items-center gap-0.5"
                    >
                      Docs <ExternalLink className="h-2 w-2" />
                    </a>
                    <a
                      href={provider.signupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] text-[var(--primary)] hover:underline flex items-center gap-0.5"
                    >
                      Sign Up <ExternalLink className="h-2 w-2" />
                    </a>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!selectedProvider && (
        <p className="text-[9px] text-white/30 italic">
          Optional: For push/in-app notifications
        </p>
      )}
    </div>
  );
}

