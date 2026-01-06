"use client";

import { useState } from "react";
import { 
  Github, 
  Database, 
  Rocket, 
  Upload, 
  Check, 
  X, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Service definition
export interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "connecting";
  connectedAs?: string; // e.g., "jrdaws" for GitHub
  projectName?: string; // e.g., "my-project" for Supabase
  connectUrl?: string;
  docsUrl?: string;
}

// Default services configuration
const DEFAULT_SERVICES: Service[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Version control and collaboration",
    icon: <Github className="h-5 w-5" />,
    status: "disconnected",
    connectUrl: "https://github.com/login/oauth/authorize",
    docsUrl: "https://docs.github.com",
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Database and authentication",
    icon: <Database className="h-5 w-5" />,
    status: "disconnected",
    connectUrl: "https://supabase.com/dashboard",
    docsUrl: "https://supabase.com/docs",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Deployment and hosting",
    icon: <Rocket className="h-5 w-5" />,
    status: "disconnected",
    connectUrl: "https://vercel.com/login",
    docsUrl: "https://vercel.com/docs",
  },
  {
    id: "uploadthing",
    name: "UploadThing",
    description: "File uploads and storage",
    icon: <Upload className="h-5 w-5" />,
    status: "disconnected",
    connectUrl: "https://uploadthing.com/dashboard",
    docsUrl: "https://docs.uploadthing.com",
  },
];

interface ServiceCardProps {
  service: Service;
  onConnect: (serviceId: string) => void;
  onDisconnect: (serviceId: string) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

function ServiceCard({ 
  service, 
  onConnect, 
  onDisconnect, 
  expanded = false,
  onToggleExpand 
}: ServiceCardProps) {
  const isConnected = service.status === "connected";
  const isConnecting = service.status === "connecting";

  return (
    <div 
      className={cn(
        "rounded-xl border transition-all duration-200",
        isConnected 
          ? "bg-emerald-500/10 border-emerald-500/30" 
          : "bg-white/5 border-white/10 hover:border-white/20"
      )}
    >
      {/* Main row */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div 
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isConnected 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-white/10 text-white/60"
            )}
          >
            {service.icon}
          </div>
          
          {/* Name and status */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{service.name}</span>
              {isConnected && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Check className="h-3 w-3" />
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-white/50">
              {isConnected && service.connectedAs 
                ? `@${service.connectedAs}` 
                : service.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : isConnected ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-red-400 hover:bg-red-500/10"
              onClick={() => onDisconnect(service.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => onConnect(service.id)}
            >
              Connect
            </Button>
          )}
          
          {onToggleExpand && (
            <button 
              onClick={onToggleExpand}
              className="p-1 text-white/40 hover:text-white/70"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/10">
          <div className="pt-3 space-y-3">
            {isConnected && service.projectName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Project</span>
                <span className="text-white font-mono">{service.projectName}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              {service.docsUrl && (
                <a
                  href={service.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-primary"
                >
                  <ExternalLink className="h-3 w-3" />
                  Documentation
                </a>
              )}
              {service.connectUrl && !isConnected && (
                <a
                  href={service.connectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-primary"
                >
                  <ExternalLink className="h-3 w-3" />
                  Dashboard
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ConnectedServicesPanelProps {
  className?: string;
  /** Initial services state - overrides defaults */
  services?: Service[];
  /** Called when a service connection is requested */
  onConnect?: (serviceId: string) => Promise<void>;
  /** Called when a service disconnection is requested */
  onDisconnect?: (serviceId: string) => Promise<void>;
  /** Compact mode - no expand, smaller cards */
  compact?: boolean;
}

export function ConnectedServicesPanel({
  className,
  services: initialServices,
  onConnect,
  onDisconnect,
  compact = false,
}: ConnectedServicesPanelProps) {
  const [services, setServices] = useState<Service[]>(initialServices || DEFAULT_SERVICES);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleConnect = async (serviceId: string) => {
    // Set connecting state
    setServices(prev => 
      prev.map(s => s.id === serviceId ? { ...s, status: "connecting" as const } : s)
    );

    try {
      if (onConnect) {
        await onConnect(serviceId);
      } else {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Set connected state
      setServices(prev => 
        prev.map(s => s.id === serviceId 
          ? { ...s, status: "connected" as const, connectedAs: "user" } 
          : s
        )
      );
    } catch (error) {
      // Reset to disconnected on error
      setServices(prev => 
        prev.map(s => s.id === serviceId ? { ...s, status: "disconnected" as const } : s)
      );
    }
  };

  const handleDisconnect = async (serviceId: string) => {
    try {
      if (onDisconnect) {
        await onDisconnect(serviceId);
      }
      
      setServices(prev => 
        prev.map(s => s.id === serviceId 
          ? { ...s, status: "disconnected" as const, connectedAs: undefined, projectName: undefined } 
          : s
        )
      );
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const connectedCount = services.filter(s => s.status === "connected").length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Connected Services</h3>
          <p className="text-sm text-white/50">
            {connectedCount} of {services.length} services connected
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-1.5">
          {services.map((service) => (
            <div
              key={service.id}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                service.status === "connected" && "bg-emerald-400",
                service.status === "connecting" && "bg-orange-400 animate-pulse",
                service.status === "disconnected" && "bg-white/20"
              )}
              title={`${service.name}: ${service.status}`}
            />
          ))}
        </div>
      </div>

      {/* Service cards */}
      <div className="space-y-2">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            expanded={!compact && expandedId === service.id}
            onToggleExpand={compact ? undefined : () => 
              setExpandedId(expandedId === service.id ? null : service.id)
            }
          />
        ))}
      </div>

      {/* Quick connect all button */}
      {connectedCount < services.length && (
        <Button
          variant="outline"
          className="w-full border-white/20 text-white/70 hover:text-white hover:border-primary/50"
          onClick={() => {
            // Connect all disconnected services
            services
              .filter(s => s.status === "disconnected")
              .forEach(s => handleConnect(s.id));
          }}
        >
          Connect All Services
        </Button>
      )}
    </div>
  );
}

export { DEFAULT_SERVICES };
export type { ServiceCardProps, ConnectedServicesPanelProps };

