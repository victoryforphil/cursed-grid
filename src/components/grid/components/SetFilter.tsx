"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Search, X } from "lucide-react";
import type { SetFilterModel } from "../types";

interface SetFilterProps {
  values: (string | null)[];
  selectedValues: (string | null)[];
  onChange: (values: (string | null)[]) => void;
  onApply?: () => void;
  onClear?: () => void;
  showButtons?: boolean;
  placeholder?: string;
}

export function SetFilter({
  values,
  selectedValues,
  onChange,
  onApply,
  onClear,
  showButtons = true,
  placeholder = "Search...",
}: SetFilterProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredValues = values.filter((value) => {
    const displayValue = value === null ? "(Blanks)" : value;
    return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const allSelected = filteredValues.every((v) => selectedValues.includes(v));
  const noneSelected = filteredValues.every((v) => !selectedValues.includes(v));

  const handleToggle = (value: string | null) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    const newValues = new Set([...selectedValues, ...filteredValues]);
    onChange(Array.from(newValues));
  };

  const handleSelectNone = () => {
    onChange(selectedValues.filter((v) => !filteredValues.includes(v)));
  };

  return (
    <div className="w-56">
      {/* Search */}
      <div className="relative px-2 py-2 border-b">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-6 pr-2 py-1 text-sm border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Select All / None */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b text-xs">
        <button
          onClick={handleSelectAll}
          className={cn(
            "hover:text-foreground",
            allSelected ? "text-primary" : "text-muted-foreground"
          )}
        >
          Select All
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={handleSelectNone}
          className={cn(
            "hover:text-foreground",
            noneSelected ? "text-primary" : "text-muted-foreground"
          )}
        >
          Select None
        </button>
      </div>

      {/* Values List */}
      <div className="max-h-48 overflow-auto py-1">
        {filteredValues.map((value, index) => {
          const displayValue = value === null ? "(Blanks)" : value;
          const isSelected = selectedValues.includes(value);

          return (
            <div
              key={value ?? `null-${index}`}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 hover:bg-accent cursor-pointer",
                isSelected && "bg-accent/50"
              )}
              onClick={() => handleToggle(value)}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-4 h-4 border rounded",
                  isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <span className="text-sm truncate">{displayValue}</span>
            </div>
          );
        })}

        {filteredValues.length === 0 && (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No values found
          </div>
        )}
      </div>

      {/* Buttons */}
      {showButtons && (
        <div className="flex gap-1 px-2 py-2 border-t">
          <button
            onClick={onApply}
            className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Apply
          </button>
          <button
            onClick={onClear}
            className="px-2 py-1 text-xs border rounded hover:bg-accent"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Extract unique values from data for a given field
 */
export function extractUniqueValues<TData>(
  data: TData[],
  field: string,
  valueFormatter?: (value: unknown) => string
): (string | null)[] {
  const values = new Set<string | null>();
  
  data.forEach((row) => {
    const value = getNestedValue(row, field);
    if (value === null || value === undefined || value === "") {
      values.add(null);
    } else {
      const formatted = valueFormatter ? valueFormatter(value) : String(value);
      values.add(formatted);
    }
  });

  return Array.from(values).sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return a.localeCompare(b);
  });
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let value = obj;
  
  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  
  return value;
}

