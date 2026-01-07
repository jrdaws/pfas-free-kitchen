"use client";

import { cn } from "@/lib/utils";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { PreviewUrlBar } from "./PreviewUrlBar";
import type { DeviceType } from "./types";
import { DEVICE_DIMENSIONS } from "./types";

interface PreviewFrameProps {
  children: React.ReactNode;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  currentPath: string;
  siteName: string;
  onRefresh?: () => void;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  className?: string;
}

const DEVICE_BUTTONS: { device: DeviceType; icon: React.ReactNode; label: string }[] = [
  { device: "desktop", icon: <Monitor className="w-4 h-4" />, label: "Desktop" },
  { device: "tablet", icon: <Tablet className="w-4 h-4" />, label: "Tablet" },
  { device: "mobile", icon: <Smartphone className="w-4 h-4" />, label: "Mobile" },
];

export function PreviewFrame({
  children,
  device,
  onDeviceChange,
  currentPath,
  siteName,
  onRefresh,
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
  className,
}: PreviewFrameProps) {
  const dimensions = DEVICE_DIMENSIONS[device];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Device selector */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          {DEVICE_BUTTONS.map(({ device: d, icon, label }) => (
            <button
              key={d}
              onClick={() => onDeviceChange(d)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                device === d
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={label}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          {dimensions.width} × {dimensions.height}
        </div>
      </div>

      {/* URL Bar */}
      <PreviewUrlBar
        currentPath={currentPath}
        siteName={siteName}
        onRefresh={onRefresh}
        onBack={onBack}
        onForward={onForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
      />

      {/* Preview container with device frame */}
      <div className="flex-1 overflow-auto bg-background p-4 flex items-start justify-center">
        <div
          className={cn(
            "relative bg-white rounded-lg shadow-2xl transition-all duration-300 overflow-hidden",
            device === "mobile" && "rounded-[2rem] border-4 border-slate-800",
            device === "tablet" && "rounded-xl border-4 border-slate-800"
          )}
          style={{
            width: device === "desktop" ? "100%" : dimensions.width,
            maxWidth: dimensions.width,
            minHeight: device === "desktop" ? "100%" : dimensions.height * 0.6,
          }}
        >
          {/* Device notch for mobile */}
          {device === "mobile" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-10" />
          )}

          {/* Content */}
          <div
            className={cn(
              "w-full h-full overflow-auto",
              device === "mobile" && "pt-6"
            )}
          >
            {children}
          </div>

          {/* Home indicator for mobile */}
          {device === "mobile" && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}

