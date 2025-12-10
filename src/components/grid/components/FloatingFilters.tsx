"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TableHead, TableRow } from "@/components/ui/table";
import { X } from "lucide-react";
import type { ColDef } from "../types";
import { getColId } from "../utils";

interface FloatingFiltersProps<TData> {
  columns: ColDef<TData>[];
  filterValues: Record<string, string>;
  onFilterChange: (colId: string, value: string, filterType: string) => void;
  onFilterClear: (colId: string) => void;
}

export function FloatingFilters<TData>({
  columns,
  filterValues,
  onFilterChange,
  onFilterClear,
}: FloatingFiltersProps<TData>) {
  return (
    <TableRow className="bg-muted/30">
      {columns.map((colDef) => {
        const colId = getColId(colDef);
        const showFilter = colDef.floatingFilter && colDef.filter;
        const filterType = typeof colDef.filter === "string" ? colDef.filter : "agTextColumnFilter";
        const isNumberFilter = filterType === "agNumberColumnFilter";
        
        return (
          <TableHead
            key={`filter-${colId}`}
            className={cn(
              "py-1 px-2",
              colDef.pinned === "left" && "sticky left-0 z-10 bg-muted/30",
              colDef.pinned === "right" && "sticky right-0 z-10 bg-muted/30"
            )}
            style={{
              width: colDef.width,
              minWidth: colDef.minWidth,
              maxWidth: colDef.maxWidth,
            }}
          >
            {showFilter ? (
              <div className="relative">
                <input
                  type={isNumberFilter ? "number" : "text"}
                  placeholder="Filter..."
                  value={filterValues[colId] || ""}
                  onChange={(e) => onFilterChange(colId, e.target.value, filterType)}
                  className="w-full px-2 py-1 text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {filterValues[colId] && (
                  <button
                    onClick={() => onFilterClear(colId)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            ) : null}
          </TableHead>
        );
      })}
    </TableRow>
  );
}

