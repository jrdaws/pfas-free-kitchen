"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CartIcon } from "@/components/cart";

interface NavProps {
  projectName?: string;
  links?: { label: string; href: string }[];
  showAuth?: boolean;
  showCart?: boolean;
  variant?: "solid" | "transparent";
}

export function Nav({
  projectName = "Store",
  links = [
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
  ],
  showAuth = true,
  showCart = true,
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
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {projectName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-white font-semibold text-lg">{projectName}</span>
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Cart */}
        {showCart && <CartIcon />}

        {/* Auth Buttons */}
        {showAuth && (
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        <button className="md:hidden text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
