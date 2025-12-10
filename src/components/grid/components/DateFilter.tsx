"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar, X } from "lucide-react";
import type { DateFilterModel } from "../types";

interface DateFilterProps {
  value?: DateFilterModel;
  onChange: (filter: DateFilterModel | null) => void;
  showButtons?: boolean;
  placeholder?: string;
}

export function DateFilter({
  value,
  onChange,
  showButtons = false,
  placeholder = "Select date...",
}: DateFilterProps) {
  const [filterType, setFilterType] = React.useState<DateFilterModel["type"]>(
    value?.type || "equals"
  );
  const [dateFrom, setDateFrom] = React.useState(value?.dateFrom || "");
  const [dateTo, setDateTo] = React.useState(value?.dateTo || "");

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      setFilterType(value.type);
      setDateFrom(value.dateFrom || "");
      setDateTo(value.dateTo || "");
    }
  }, [value]);

  const applyFilter = React.useCallback(() => {
    if (filterType === "blank" || filterType === "notBlank") {
      onChange({
        filterType: "date",
        type: filterType,
      });
    } else if (!dateFrom && !showButtons) {
      onChange(null);
    } else if (dateFrom) {
      onChange({
        filterType: "date",
        type: filterType,
        dateFrom,
        dateTo: filterType === "inRange" ? dateTo : undefined,
      });
    }
  }, [filterType, dateFrom, dateTo, onChange, showButtons]);

  // Auto-apply when values change (if not using buttons)
  React.useEffect(() => {
    if (!showButtons) {
      applyFilter();
    }
  }, [showButtons, applyFilter]);

  const handleClear = () => {
    setDateFrom("");
    setDateTo("");
    setFilterType("equals");
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {/* Filter type selector */}
      <select
        className="w-full p-1.5 text-sm border rounded bg-background"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value as DateFilterModel["type"])}
      >
        <option value="equals">Equals</option>
        <option value="notEqual">Not equal</option>
        <option value="lessThan">Before</option>
        <option value="greaterThan">After</option>
        <option value="inRange">In range</option>
        <option value="blank">Blank</option>
        <option value="notBlank">Not blank</option>
      </select>

      {/* Date inputs */}
      {filterType !== "blank" && filterType !== "notBlank" && (
        <>
          <div className="relative">
            <input
              type="date"
              className="w-full p-1.5 text-sm border rounded bg-background pr-8"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder={placeholder}
            />
            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {filterType === "inRange" && (
            <div className="relative">
              <input
                type="date"
                className="w-full p-1.5 text-sm border rounded bg-background pr-8"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To date..."
              />
              <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </>
      )}

      {/* Buttons */}
      {showButtons && (
        <div className="flex gap-1">
          <button
            onClick={applyFilter}
            className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
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
 * Compact date filter for floating filter row
 */
interface FloatingDateFilterProps {
  value?: DateFilterModel;
  onChange: (filter: DateFilterModel | null) => void;
  placeholder?: string;
}

export function FloatingDateFilter({
  value,
  onChange,
  placeholder = "Filter...",
}: FloatingDateFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (!dateValue) {
      onChange(null);
    } else {
      onChange({
        filterType: "date",
        type: "equals",
        dateFrom: dateValue,
      });
    }
  };

  return (
    <div className="relative">
      <input
        type="date"
        className="w-full px-2 py-1 text-xs border rounded bg-background"
        value={value?.dateFrom || ""}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}

/**
 * Check if a date value matches a date filter
 */
export function matchesDateFilter(
  value: unknown,
  filter: DateFilterModel
): boolean {
  if (filter.type === "blank") {
    return value === null || value === undefined || value === "";
  }
  if (filter.type === "notBlank") {
    return value !== null && value !== undefined && value !== "";
  }

  // Parse the value as a date
  const dateValue = parseDate(value);
  if (!dateValue) return false;

  const filterFrom = filter.dateFrom ? new Date(filter.dateFrom) : null;
  const filterTo = filter.dateTo ? new Date(filter.dateTo) : null;

  switch (filter.type) {
    case "equals":
      return filterFrom ? isSameDay(dateValue, filterFrom) : false;
    case "notEqual":
      return filterFrom ? !isSameDay(dateValue, filterFrom) : false;
    case "lessThan":
      return filterFrom ? dateValue < filterFrom : false;
    case "greaterThan":
      return filterFrom ? dateValue > filterFrom : false;
    case "inRange":
      if (!filterFrom || !filterTo) return false;
      return dateValue >= filterFrom && dateValue <= filterTo;
    default:
      return true;
  }
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

