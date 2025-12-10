"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Filter, X, ChevronDown, ChevronRight, Search } from "lucide-react";
import type { ColDef, FilterModel, TextFilterModel, NumberFilterModel } from "../types";
import { getColId } from "../utils";

interface FiltersPanelProps<TData> {
  columns: ColDef<TData>[];
  filterModel: FilterModel;
  onFilterChange: (colId: string, filter: TextFilterModel | NumberFilterModel | null) => void;
  onClearAll: () => void;
  onClose?: () => void;
  className?: string;
  suppressExpandAll?: boolean;
  suppressFilterSearch?: boolean;
}

export function FiltersPanel<TData>({
  columns,
  filterModel,
  onFilterChange,
  onClearAll,
  onClose,
  className,
  suppressExpandAll = false,
  suppressFilterSearch = false,
}: FiltersPanelProps<TData>) {
  const [expandedFilters, setExpandedFilters] = React.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter only filterable columns
  const filterableColumns = columns.filter(
    (col) => col.filter !== false && (col.filter === true || typeof col.filter === "string")
  );

  // Filter by search term
  const visibleColumns = filterableColumns.filter((col) => {
    const name = col.headerName || col.field?.toString() || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleFilter = (colId: string) => {
    setExpandedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) {
        next.delete(colId);
      } else {
        next.add(colId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedFilters(new Set(visibleColumns.map((col) => getColId(col))));
  };

  const collapseAll = () => {
    setExpandedFilters(new Set());
  };

  const getFilterType = (colDef: ColDef<TData>): "text" | "number" | "set" => {
    if (colDef.filter === "agNumberColumnFilter") return "number";
    if (colDef.filter === "agSetColumnFilter") return "set";
    return "text";
  };

  const getActiveFilterCount = () => {
    return Object.keys(filterModel).length;
  };

  const renderFilterInput = (colDef: ColDef<TData>) => {
    const colId = getColId(colDef);
    const filterType = getFilterType(colDef);
    const currentFilter = filterModel[colId] as TextFilterModel | NumberFilterModel | undefined;

    if (filterType === "number") {
      return (
        <div className="space-y-2">
          <select
            className="w-full p-1.5 text-sm border rounded bg-background"
            value={(currentFilter as NumberFilterModel)?.type || "equals"}
            onChange={(e) => {
              const filter = currentFilter as NumberFilterModel | undefined;
              onFilterChange(colId, {
                filterType: "number",
                type: e.target.value as NumberFilterModel["type"],
                filter: filter?.filter,
              });
            }}
          >
            <option value="equals">Equals</option>
            <option value="notEqual">Not equal</option>
            <option value="greaterThan">Greater than</option>
            <option value="greaterThanOrEqual">Greater than or equal</option>
            <option value="lessThan">Less than</option>
            <option value="lessThanOrEqual">Less than or equal</option>
            <option value="inRange">In range</option>
          </select>
          <input
            type="number"
            placeholder="Filter..."
            className="w-full p-1.5 text-sm border rounded bg-background"
            value={(currentFilter as NumberFilterModel)?.filter ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              if (value === null) {
                onFilterChange(colId, null);
              } else {
                onFilterChange(colId, {
                  filterType: "number",
                  type: (currentFilter as NumberFilterModel)?.type || "equals",
                  filter: value,
                });
              }
            }}
          />
        </div>
      );
    }

    // Default text filter
    return (
      <div className="space-y-2">
        <select
          className="w-full p-1.5 text-sm border rounded bg-background"
          value={(currentFilter as TextFilterModel)?.type || "contains"}
          onChange={(e) => {
            const filter = currentFilter as TextFilterModel | undefined;
            if (filter?.filter) {
              onFilterChange(colId, {
                filterType: "text",
                type: e.target.value as TextFilterModel["type"],
                filter: filter.filter,
              });
            }
          }}
        >
          <option value="contains">Contains</option>
          <option value="notContains">Not contains</option>
          <option value="equals">Equals</option>
          <option value="notEqual">Not equal</option>
          <option value="startsWith">Starts with</option>
          <option value="endsWith">Ends with</option>
        </select>
        <input
          type="text"
          placeholder="Filter..."
          className="w-full p-1.5 text-sm border rounded bg-background"
          value={(currentFilter as TextFilterModel)?.filter ?? ""}
          onChange={(e) => {
            if (!e.target.value) {
              onFilterChange(colId, null);
            } else {
              onFilterChange(colId, {
                filterType: "text",
                type: (currentFilter as TextFilterModel)?.type || "contains",
                filter: e.target.value,
              });
            }
          }}
        />
      </div>
    );
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className={cn("bg-popover border rounded-lg shadow-lg w-72", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search */}
      {!suppressFilterSearch && (
        <div className="px-3 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search filters..."
              className="w-full pl-7 pr-2 py-1 text-sm border rounded bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b text-xs text-muted-foreground">
        {!suppressExpandAll && (
          <div className="flex gap-2">
            <button onClick={expandAll} className="hover:text-foreground">
              Expand all
            </button>
            <span>|</span>
            <button onClick={collapseAll} className="hover:text-foreground">
              Collapse
            </button>
          </div>
        )}
        <button
          onClick={onClearAll}
          className={cn(
            "hover:text-foreground",
            activeCount === 0 && "opacity-50 cursor-not-allowed"
          )}
          disabled={activeCount === 0}
        >
          Clear all
        </button>
      </div>

      {/* Filter List */}
      <div className="max-h-72 overflow-auto py-1">
        {visibleColumns.map((colDef) => {
          const colId = getColId(colDef);
          const isExpanded = expandedFilters.has(colId);
          const hasFilter = colId in filterModel;

          return (
            <div key={colId} className="border-b last:border-b-0">
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent",
                  hasFilter && "text-primary font-medium"
                )}
                onClick={() => toggleFilter(colId)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span className="flex-1 truncate text-sm">
                  {colDef.headerName || colDef.field?.toString() || colId}
                </span>
                {hasFilter && (
                  <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="px-3 pb-2 bg-muted/30">
                  {renderFilterInput(colDef)}
                  {hasFilter && (
                    <button
                      className="w-full mt-2 px-2 py-1 text-xs text-center border rounded hover:bg-accent"
                      onClick={() => onFilterChange(colId, null)}
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {visibleColumns.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            No filterable columns
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Toolbar button to toggle filters panel
 */
interface FiltersPanelButtonProps<TData> {
  columns: ColDef<TData>[];
  filterModel: FilterModel;
  onFilterChange: (colId: string, filter: TextFilterModel | NumberFilterModel | null) => void;
  onClearAll: () => void;
  suppressExpandAll?: boolean;
  suppressFilterSearch?: boolean;
}

export function FiltersPanelButton<TData>({
  columns,
  filterModel,
  onFilterChange,
  onClearAll,
  suppressExpandAll,
  suppressFilterSearch,
}: FiltersPanelButtonProps<TData>) {
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

  const activeCount = Object.keys(filterModel).length;

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
        <Filter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div ref={panelRef} className="absolute right-0 top-full mt-1 z-50">
          <FiltersPanel
            columns={columns}
            filterModel={filterModel}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
            onClose={() => setIsOpen(false)}
            suppressExpandAll={suppressExpandAll}
            suppressFilterSearch={suppressFilterSearch}
          />
        </div>
      )}
    </div>
  );
}
