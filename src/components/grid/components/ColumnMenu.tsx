"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Menu,
  ArrowUpAZ,
  ArrowDownAZ,
  EyeOff,
  Pin,
  PinOff,
  Filter,
  X,
} from "lucide-react";
import type { ColDef, SortModelItem, FilterModel, TextFilterModel, NumberFilterModel, SetFilterModel } from "../types";
import { getColId } from "../utils";
import { SetFilter } from "./SetFilter";

interface ColumnMenuProps<TData> {
  colDef: ColDef<TData>;
  sortModel: SortModelItem[];
  filterModel: FilterModel;
  availableValues?: (string | null)[]; // For set filter
  onSort: (colId: string, direction: "asc" | "desc" | null) => void;
  onHide: (colId: string) => void;
  onPin: (colId: string, pinned: "left" | "right" | null) => void;
  onFilterChange: (colId: string, filter: TextFilterModel | NumberFilterModel | SetFilterModel | null) => void;
}

export function ColumnMenu<TData>({
  colDef,
  sortModel,
  filterModel,
  availableValues = [],
  onSort,
  onHide,
  onPin,
  onFilterChange,
}: ColumnMenuProps<TData>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [filterValue, setFilterValue] = React.useState("");
  const [filterType, setFilterType] = React.useState<string>("contains");
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const colId = getColId(colDef);
  const currentSort = sortModel.find((s) => s.colId === colId);
  const currentFilter = filterModel[colId];
  const filterTypeStr = typeof colDef.filter === "string" ? colDef.filter : "agTextColumnFilter";
  const isNumberColumn = filterTypeStr === "agNumberColumnFilter";
  const isSetColumn = filterTypeStr === "agSetColumnFilter";

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
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

  // Initialize filter value from model
  React.useEffect(() => {
    if (currentFilter && typeof currentFilter === "object" && "filter" in currentFilter) {
      setFilterValue(String((currentFilter as { filter: unknown }).filter ?? ""));
      if ("type" in currentFilter) {
        setFilterType((currentFilter as { type: string }).type);
      }
    } else {
      setFilterValue("");
    }
  }, [currentFilter]);

  const handleApplyFilter = () => {
    if (!filterValue) {
      onFilterChange(colId, null);
    } else if (isNumberColumn) {
      const numValue = parseFloat(filterValue);
      if (!isNaN(numValue)) {
        onFilterChange(colId, {
          filterType: "number",
          type: filterType as NumberFilterModel["type"],
          filter: numValue,
        });
      }
    } else {
      onFilterChange(colId, {
        filterType: "text",
        type: filterType as TextFilterModel["type"],
        filter: filterValue,
      });
    }
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setFilterValue("");
    onFilterChange(colId, null);
  };

  const handleSetFilterApply = (selectedValues: (string | null)[]) => {
    if (selectedValues.length === 0) {
      onFilterChange(colId, null);
    } else {
      onFilterChange(colId, {
        filterType: "set",
        values: selectedValues,
      });
    }
    setIsOpen(false);
  };

  const textFilterOptions = [
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Not contains" },
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" },
  ];

  const numberFilterOptions = [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "greaterThan", label: "Greater than" },
    { value: "greaterThanOrEqual", label: "Greater than or equal" },
    { value: "lessThan", label: "Less than" },
    { value: "lessThanOrEqual", label: "Less than or equal" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" },
  ];

  const filterOptions = isNumberColumn ? numberFilterOptions : textFilterOptions;
  
  // Get current selected values for set filter
  const currentSetValues = currentFilter && typeof currentFilter === "object" && "values" in currentFilter
    ? (currentFilter as SetFilterModel).values
    : [];

  if (colDef.suppressMenu) {
    return null;
  }

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "p-0.5 rounded hover:bg-accent/50 transition-colors",
          isOpen && "bg-accent"
        )}
      >
        <Menu className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 z-50 min-w-[200px] bg-popover border rounded-md shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1">
            {/* Sort Options */}
            {colDef.sortable && (
              <>
                <button
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent",
                    currentSort?.sort === "asc" && "bg-accent"
                  )}
                  onClick={() => {
                    onSort(colId, currentSort?.sort === "asc" ? null : "asc");
                    setIsOpen(false);
                  }}
                >
                  <ArrowUpAZ className="h-4 w-4" />
                  Sort Ascending
                </button>
                <button
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent",
                    currentSort?.sort === "desc" && "bg-accent"
                  )}
                  onClick={() => {
                    onSort(colId, currentSort?.sort === "desc" ? null : "desc");
                    setIsOpen(false);
                  }}
                >
                  <ArrowDownAZ className="h-4 w-4" />
                  Sort Descending
                </button>
                <div className="border-t my-1" />
              </>
            )}

            {/* Filter Options */}
            {colDef.filter && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Filter
                </div>
                
                {/* Set Filter (multi-select) */}
                {isSetColumn ? (
                  <div className="p-2">
                    <SetFilter
                      values={availableValues}
                      selectedValues={currentSetValues}
                      onApply={handleSetFilterApply}
                      onClear={handleClearFilter}
                      searchable
                    />
                  </div>
                ) : (
                  /* Text/Number Filter */
                  <div className="px-2 pb-2 space-y-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-2 py-1 text-xs border rounded bg-background"
                    >
                      {filterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {filterType !== "blank" && filterType !== "notBlank" && (
                      <input
                        type={isNumberColumn ? "number" : "text"}
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        placeholder="Filter value..."
                        className="w-full px-2 py-1 text-xs border rounded bg-background"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleApplyFilter();
                          }
                        }}
                      />
                    )}
                    <div className="flex gap-1">
                      <button
                        onClick={handleApplyFilter}
                        className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        Apply
                      </button>
                      <button
                        onClick={handleClearFilter}
                        className="px-2 py-1 text-xs border rounded hover:bg-accent"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="border-t my-1" />
              </>
            )}

            {/* Pin Options */}
            <button
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent",
                colDef.pinned === "left" && "bg-accent"
              )}
              onClick={() => {
                onPin(colId, colDef.pinned === "left" ? null : "left");
                setIsOpen(false);
              }}
            >
              <Pin className="h-4 w-4" />
              Pin Left
            </button>
            <button
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent",
                colDef.pinned === "right" && "bg-accent"
              )}
              onClick={() => {
                onPin(colId, colDef.pinned === "right" ? null : "right");
                setIsOpen(false);
              }}
            >
              <Pin className="h-4 w-4 rotate-180" />
              Pin Right
            </button>
            {colDef.pinned && (
              <button
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent"
                onClick={() => {
                  onPin(colId, null);
                  setIsOpen(false);
                }}
              >
                <PinOff className="h-4 w-4" />
                Unpin
              </button>
            )}

            <div className="border-t my-1" />

            {/* Hide Column */}
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent text-destructive"
              onClick={() => {
                onHide(colId);
                setIsOpen(false);
              }}
            >
              <EyeOff className="h-4 w-4" />
              Hide Column
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
