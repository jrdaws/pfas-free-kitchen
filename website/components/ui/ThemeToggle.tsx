'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  // Default to dark theme (Navy)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage for saved preference
    const saved = localStorage.getItem('theme');
    
    // Only switch to light if explicitly saved as 'light'
    // Dark is the default - no class needed on :root
    if (saved === 'light') {
      setTheme('light');
      document.documentElement.classList.add('light');
    } else {
      // Ensure dark theme (remove .light class if present)
      setTheme('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-12 h-12" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full 
                 bg-card border border-border shadow-lg
                 hover:border-primary hover:scale-105
                 transition-all duration-200
                 group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-foreground-secondary group-hover:text-primary transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-foreground-secondary group-hover:text-primary transition-colors" />
      )}
    </button>
  );
}
