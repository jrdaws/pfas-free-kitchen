"use client";

import { cn } from "@/lib/utils";

interface NavProps {
  projectName: string;
  links?: string[];
  showAuth?: boolean;
  variant?: "solid" | "transparent";
}

export function Nav({
  projectName,
  links = ["Features", "Pricing", "About"],
  showAuth = true,
  variant = "solid",
}: NavProps) {
  return (
    <nav
      className={cn(
        "w-full px-6 py-4 flex items-center justify-between",
        variant === "solid" && "bg-[#0A0A0A] border-b border-white/10",
        variant === "transparent" && "bg-transparent absolute top-0 left-0 right-0 z-50"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {projectName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-white font-semibold text-lg">{projectName}</span>
      </div>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link, i) => (
          <a
            key={i}
            href={`#${link.toLowerCase()}`}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Auth Buttons */}
      {showAuth && (
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-white transition-colors text-sm">
            Log in
          </button>
          <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
            Sign up
          </button>
        </div>
      )}

      {/* Mobile menu button */}
      <button className="md:hidden text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>
  );
}
