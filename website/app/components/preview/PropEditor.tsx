"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useCompositionStore, useSelectedSection } from "@/lib/stores/composition-store";
import { getPatternById } from "@/lib/composer/selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Settings2,
  Wand2,
  Undo2,
  Redo2,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import type { PatternSlot } from "@/lib/composer/types";

// ============================================================================
// Types
// ============================================================================

interface PropEditorProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// ============================================================================
// Slot Editor Components
// ============================================================================

interface SlotEditorProps {
  slot: PatternSlot;
  value: unknown;
  onChange: (value: unknown) => void;
}

function TextSlotEditor({ slot, value, onChange }: SlotEditorProps) {
  const strValue = (value as string) || '';
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium capitalize">
          {slot.name.replace(/([A-Z])/g, ' $1').trim()}
        </Label>
        {slot.required && (
          <Badge variant="secondary" className="text-[9px] h-4">
            Required
          </Badge>
        )}
      </div>
      <Input
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={slot.description || `Enter ${slot.name}...`}
        maxLength={slot.maxLength}
        className="bg-stone-800 border-stone-700 text-sm"
      />
      {slot.maxLength && (
        <p className="text-[10px] text-stone-500 text-right">
          {strValue.length}/{slot.maxLength}
        </p>
      )}
    </div>
  );
}

function RichTextSlotEditor({ slot, value, onChange }: SlotEditorProps) {
  const strValue = (value as string) || '';
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium capitalize">
          {slot.name.replace(/([A-Z])/g, ' $1').trim()}
        </Label>
        {slot.required && (
          <Badge variant="secondary" className="text-[9px] h-4">
            Required
          </Badge>
        )}
      </div>
      <Textarea
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={slot.description || `Enter ${slot.name}...`}
        className="bg-stone-800 border-stone-700 text-sm min-h-[80px]"
      />
    </div>
  );
}

function BooleanSlotEditor({ slot, value, onChange }: SlotEditorProps) {
  const boolValue = value as boolean;
  
  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-xs font-medium capitalize">
        {slot.name.replace(/([A-Z])/g, ' $1').trim()}
      </Label>
      <Switch
        checked={boolValue}
        onCheckedChange={onChange}
      />
    </div>
  );
}

function NumberSlotEditor({ slot, value, onChange }: SlotEditorProps) {
  const numValue = (value as number) || 0;
  
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium capitalize">
        {slot.name.replace(/([A-Z])/g, ' $1').trim()}
      </Label>
      <Input
        type="number"
        value={numValue}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="bg-stone-800 border-stone-700 text-sm"
      />
    </div>
  );
}

function ImageSlotEditor({ slot, value, onChange }: SlotEditorProps) {
  const strValue = (value as string) || '';
  
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium capitalize">
        {slot.name.replace(/([A-Z])/g, ' $1').trim()}
      </Label>
      <Input
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Image URL..."
        className="bg-stone-800 border-stone-700 text-sm"
      />
      {strValue && (
        <div className="relative aspect-video bg-stone-800 rounded overflow-hidden">
          <img 
            src={strValue} 
            alt="" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.jpg';
            }}
          />
        </div>
      )}
    </div>
  );
}

function ArraySlotEditor({ slot, value, onChange }: SlotEditorProps) {
  const items = (value as unknown[]) || [];
  
  const addItem = () => {
    onChange([...items, {}]);
  };
  
  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium capitalize">
          {slot.name.replace(/([A-Z])/g, ' $1').trim()}
        </Label>
        <Badge variant="secondary" className="text-[9px]">
          {items.length} items
        </Badge>
      </div>
      
      <div className="space-y-2 pl-2 border-l border-stone-700">
        {items.slice(0, 5).map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 p-2 bg-stone-800/50 rounded text-xs"
          >
            <span className="text-stone-500">{index + 1}.</span>
            <span className="flex-1 truncate text-stone-300">
              {typeof item === 'object' ? JSON.stringify(item).slice(0, 30) : String(item)}
            </span>
            <button
              onClick={() => removeItem(index)}
              className="p-1 text-stone-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        {items.length > 5 && (
          <p className="text-[10px] text-stone-500 pl-2">
            +{items.length - 5} more items
          </p>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full text-xs h-7"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Item
      </Button>
    </div>
  );
}

function SlotEditor({ slot, value, onChange }: SlotEditorProps) {
  switch (slot.type) {
    case 'text':
      return <TextSlotEditor slot={slot} value={value} onChange={onChange} />;
    case 'richText':
      return <RichTextSlotEditor slot={slot} value={value} onChange={onChange} />;
    case 'boolean':
      return <BooleanSlotEditor slot={slot} value={value} onChange={onChange} />;
    case 'number':
      return <NumberSlotEditor slot={slot} value={value} onChange={onChange} />;
    case 'image':
      return <ImageSlotEditor slot={slot} value={value} onChange={onChange} />;
    case 'array':
      return <ArraySlotEditor slot={slot} value={value} onChange={onChange} />;
    default:
      return <TextSlotEditor slot={slot} value={value} onChange={onChange} />;
  }
}

// ============================================================================
// Prop Editor Component
// ============================================================================

export function PropEditor({ isOpen, onClose, className }: PropEditorProps) {
  const { 
    composition, 
    selectedPageId, 
    selectedSectionIndex,
    updateSectionProps,
    updateSectionVariant,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useCompositionStore();
  
  const section = useSelectedSection();
  const pattern = section ? getPatternById(section.patternId) : null;
  
  const handlePropChange = useCallback((slotName: string, value: unknown) => {
    if (!selectedPageId || selectedSectionIndex === null || !section) return;
    
    updateSectionProps(selectedPageId, selectedSectionIndex, {
      ...section.props,
      [slotName]: value,
    });
  }, [selectedPageId, selectedSectionIndex, section, updateSectionProps]);
  
  const handleVariantChange = useCallback((variant: string) => {
    if (!selectedPageId || selectedSectionIndex === null) return;
    updateSectionVariant(selectedPageId, selectedSectionIndex, variant);
  }, [selectedPageId, selectedSectionIndex, updateSectionVariant]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={cn(
        "fixed right-0 top-0 h-screen w-80 bg-stone-900 border-l border-stone-800 z-50",
        "flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Properties</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className={cn(
              "p-1.5 rounded transition-colors",
              canUndo() 
                ? "text-stone-400 hover:text-white hover:bg-stone-800"
                : "text-stone-600 cursor-not-allowed"
            )}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className={cn(
              "p-1.5 rounded transition-colors",
              canRedo()
                ? "text-stone-400 hover:text-white hover:bg-stone-800"
                : "text-stone-600 cursor-not-allowed"
            )}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1">
        {!section || !pattern ? (
          <div className="p-6 text-center text-stone-500">
            <Settings2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a section to edit its properties</p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Pattern Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">{pattern.name}</h3>
              <p className="text-xs text-stone-400 capitalize">{pattern.category}</p>
            </div>
            
            {/* Variant Selector */}
            {pattern.variants.length > 1 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Variant</Label>
                <Select
                  value={section.variant}
                  onValueChange={handleVariantChange}
                >
                  <SelectTrigger className="bg-stone-800 border-stone-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pattern.variants.map((v) => (
                      <SelectItem key={v} value={v} className="capitalize">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="h-px bg-stone-800" />
            
            {/* Slot Editors */}
            <div className="space-y-4">
              {pattern.slots.map((slot) => (
                <SlotEditor
                  key={slot.name}
                  slot={slot}
                  value={section.props[slot.name]}
                  onChange={(value) => handlePropChange(slot.name, value)}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
      
      {/* Footer */}
      {section && pattern && (
        <div className="px-4 py-3 border-t border-stone-800">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={() => {
              // Trigger regeneration via API
              console.log('[PropEditor] Regenerate section');
            }}
          >
            <Wand2 className="h-4 w-4" />
            Regenerate Content
          </Button>
        </div>
      )}
    </div>
  );
}

export default PropEditor;

