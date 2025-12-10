"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Columns3, Eye, EyeOff, GripVertical, X, Check } from "lucide-react";
import type { ColDef } from "../types";
import { getColId } from "../utils";

interface ColumnsPanelProps<TData> {
  columns: ColDef<TData>[];
  onColumnVisibilityChange: (colId: string, visible: boolean) => void;
  onClose?: () => void;
  className?: string;
}

export function ColumnsPanel<TData>({
  columns,
  onColumnVisibilityChange,
  onClose,
  className,
}: ColumnsPanelProps<TData>) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredColumns = columns.filter((col) => {
    const name = col.headerName || col.field?.toString() || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const visibleCount = columns.filter((col) => !col.hide).length;
  const totalCount = columns.length;

  const handleSelectAll = () => {
    columns.forEach((col) => {
      onColumnVisibilityChange(getColId(col), true);
    });
  };

  const handleDeselectAll = () => {
    columns.forEach((col) => {
      onColumnVisibilityChange(getColId(col), false);
    });
  };

  return (
    <div className={cn("bg-popover border rounded-lg shadow-lg w-64", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Columns3 className="h-4 w-4" />
          Columns
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b">
        <input
          type="text"
          placeholder="Search columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded bg-background"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b text-xs text-muted-foreground">
        <span>{visibleCount} of {totalCount} visible</span>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="hover:text-foreground"
          >
            Show all
          </button>
          <span>|</span>
          <button
            onClick={handleDeselectAll}
            className="hover:text-foreground"
          >
            Hide all
          </button>
        </div>
      </div>

      {/* Column List */}
      <div className="max-h-64 overflow-auto py-1">
        {filteredColumns.map((col) => {
          const colId = getColId(col);
          const isVisible = !col.hide;
          const name = col.headerName || col.field?.toString() || colId;

          return (
            <div
              key={colId}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 hover:bg-accent cursor-pointer",
                !isVisible && "opacity-50"
              )}
              onClick={() => onColumnVisibilityChange(colId, !isVisible)}
            >
              <div className="flex items-center justify-center w-4 h-4">
                {isVisible ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : null}
              </div>
              <GripVertical className="h-3 w-3 text-muted-foreground" />
              <span className="flex-1 text-sm truncate">{name}</span>
              {isVisible ? (
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          );
        })}

        {filteredColumns.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            No columns found
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Toolbar button to toggle columns panel
 */
interface ColumnsPanelButtonProps<TData> {
  columns: ColDef<TData>[];
  onColumnVisibilityChange: (colId: string, visible: boolean) => void;
}

export function ColumnsPanelButton<TData>({
  columns,
  onColumnVisibilityChange,
}: ColumnsPanelButtonProps<TData>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const hiddenCount = columns.filter((col) => col.hide).length;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 text-sm border rounded hover:bg-accent",
          isOpen && "bg-accent"
        )}
      >
        <Columns3 className="h-4 w-4" />
        Columns
        {hiddenCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full">
            {hiddenCount} hidden
          </span>
        )}
      </button>

      {isOpen && (
        <div ref={panelRef} className="absolute right-0 top-full mt-1 z-50">
          <ColumnsPanel
            columns={columns}
            onColumnVisibilityChange={onColumnVisibilityChange}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

