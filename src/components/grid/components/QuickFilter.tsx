"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

interface QuickFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function QuickFilter({
  value,
  onChange,
  placeholder = "Search all columns...",
}: QuickFilterProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
      <Search className="h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="p-1 hover:bg-accent rounded"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

