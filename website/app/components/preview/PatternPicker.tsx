"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getAvailablePatterns, getPatternsByCategory } from "@/lib/composer/selector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Layout,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Sparkles,
  LayoutGrid,
  Users,
  BarChart3,
  Navigation,
  FileText,
  ShoppingCart,
} from "lucide-react";
import type { Pattern } from "@/lib/composer/types";

// ============================================================================
// Types
// ============================================================================

interface PatternPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patternId: string) => void;
  insertAtIndex?: number;
}

// ============================================================================
// Category Config
// ============================================================================

const CATEGORIES = [
  { id: 'all', label: 'All Patterns', icon: LayoutGrid },
  { id: 'hero', label: 'Hero', icon: Layout },
  { id: 'features', label: 'Features', icon: Sparkles },
  { id: 'pricing', label: 'Pricing', icon: CreditCard },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'cta', label: 'Call to Action', icon: Sparkles },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'footer', label: 'Footer', icon: FileText },
  { id: 'product', label: 'Product', icon: ShoppingCart },
] as const;

// ============================================================================
// Pattern Card Component
// ============================================================================

interface PatternCardProps {
  pattern: Pattern;
  onClick: () => void;
}

function PatternCard({ pattern, onClick }: PatternCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg border border-stone-700",
        "bg-stone-800/50 hover:bg-stone-800 hover:border-primary/50",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-white truncate">
            {pattern.name}
          </h4>
          <p className="text-xs text-stone-400 mt-1 capitalize">
            {pattern.category}
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] shrink-0">
          {pattern.variants.length} variants
        </Badge>
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {pattern.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 bg-stone-700/50 text-stone-400 rounded"
          >
            {tag}
          </span>
        ))}
        {pattern.tags.length > 4 && (
          <span className="text-[10px] px-1.5 py-0.5 text-stone-500">
            +{pattern.tags.length - 4}
          </span>
        )}
      </div>
      
      {/* Slots preview */}
      <div className="mt-3 text-[10px] text-stone-500">
        {pattern.slots.filter(s => s.required).length} required fields
      </div>
    </button>
  );
}

// ============================================================================
// Pattern Picker Component
// ============================================================================

export function PatternPicker({
  isOpen,
  onClose,
  onSelect,
  insertAtIndex,
}: PatternPickerProps) {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  const allPatterns = useMemo(() => getAvailablePatterns(), []);
  
  const filteredPatterns = useMemo(() => {
    let patterns = category === 'all' 
      ? allPatterns 
      : allPatterns.filter(p => p.category === category);
    
    if (search.trim()) {
      const query = search.toLowerCase();
      patterns = patterns.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    
    return patterns;
  }, [allPatterns, category, search]);
  
  const handleSelect = (patternId: string) => {
    onSelect(patternId);
    onClose();
    setSearch('');
    setCategory('all');
  };
  
  const handleClose = () => {
    onClose();
    setSearch('');
    setCategory('all');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-stone-900 border-stone-700">
        <DialogHeader className="px-6 py-4 border-b border-stone-800">
          <DialogTitle className="text-lg font-semibold">
            Add Section
            {insertAtIndex !== undefined && (
              <span className="text-sm font-normal text-stone-400 ml-2">
                at position {insertAtIndex + 1}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 min-h-0">
          {/* Category Sidebar */}
          <div className="w-48 border-r border-stone-800 p-3 overflow-y-auto">
            <div className="space-y-1">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    category === id
                      ? "bg-primary text-primary-foreground"
                      : "text-stone-400 hover:text-white hover:bg-stone-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {id !== 'all' && (
                    <span className="ml-auto text-xs opacity-60">
                      {allPatterns.filter(p => p.category === id).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Pattern Grid */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Search */}
            <div className="p-4 border-b border-stone-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <Input
                  placeholder="Search patterns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-stone-800 border-stone-700 focus:border-primary"
                />
              </div>
            </div>
            
            {/* Results */}
            <ScrollArea className="flex-1 p-4">
              {filteredPatterns.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <p>No patterns found</p>
                  <p className="text-sm mt-1">Try a different search or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredPatterns.map((pattern) => (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      onClick={() => handleSelect(pattern.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {/* Footer */}
            <div className="px-4 py-3 border-t border-stone-800 text-xs text-stone-500">
              {filteredPatterns.length} pattern{filteredPatterns.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PatternPicker;

