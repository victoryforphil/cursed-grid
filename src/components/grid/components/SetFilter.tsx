"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Search, X } from "lucide-react";
import type { SetFilterModel } from "../types";

interface SetFilterProps {
  values: (string | null)[];
  selectedValues: (string | null)[];
  onApply: (selectedValues: (string | null)[]) => void;
  onClear: () => void;
  searchable?: boolean;
  defaultToNothingSelected?: boolean;
}

export function SetFilter({
  values,
  selectedValues: initialSelectedValues,
  onApply,
  onClear,
  searchable = true,
  defaultToNothingSelected = false,
}: SetFilterProps) {
  const [selectedValues, setSelectedValues] = React.useState<Set<string | null>>(
    new Set(initialSelectedValues)
  );
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredValues = values.filter((value) => {
    if (!searchTerm) return true;
    const strValue = String(value ?? "(Blanks)").toLowerCase();
    return strValue.includes(searchTerm.toLowerCase());
  });

  const isAllSelected = filteredValues.every((v) => selectedValues.has(v));
  const isNoneSelected = filteredValues.every((v) => !selectedValues.has(v));

  const handleToggle = (value: string | null) => {
    setSelectedValues((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedValues(new Set(values));
  };

  const handleSelectNone = () => {
    setSelectedValues(new Set());
  };

  const handleApply = () => {
    onApply(Array.from(selectedValues));
  };

  return (
    <div className="w-64">
      {/* Search */}
      {searchable && (
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-7 py-1 text-sm border rounded bg-background"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Select All/None */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b bg-muted/30 text-xs">
        <button
          onClick={handleSelectAll}
          disabled={isAllSelected}
          className="hover:text-primary disabled:opacity-50"
        >
          Select All
        </button>
        <span className="text-muted-foreground">
          {selectedValues.size} of {values.length}
        </span>
        <button
          onClick={handleSelectNone}
          disabled={isNoneSelected}
          className="hover:text-primary disabled:opacity-50"
        >
          Select None
        </button>
      </div>

      {/* Values List */}
      <div className="max-h-64 overflow-auto">
        {filteredValues.map((value, index) => {
          const isSelected = selectedValues.has(value);
          const displayValue = value === null ? "(Blanks)" : String(value);

          return (
            <div
              key={`${value}-${index}`}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent cursor-pointer"
              onClick={() => handleToggle(value)}
            >
              <div className={cn(
                "flex items-center justify-center w-4 h-4 border rounded",
                isSelected && "bg-primary border-primary"
              )}>
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <span className="flex-1 text-sm truncate">{displayValue}</span>
            </div>
          );
        })}

        {filteredValues.length === 0 && (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No values found
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-2 border-t">
        <button
          onClick={handleApply}
          className="flex-1 px-2 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Apply
        </button>
        <button
          onClick={() => {
            handleSelectNone();
            onClear();
          }}
          className="px-2 py-1 text-sm border rounded hover:bg-accent"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
