"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TableHead, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { ColDef, SortModelItem } from "../types";
import { getColId } from "../utils";

interface GridHeaderProps<TData> {
  columns: ColDef<TData>[];
  sortModel: SortModelItem[];
  headerHeight: number;
  multiSortKey: "ctrl" | "shift";
  onSort: (colId: string, isMultiSort: boolean) => void;
}

export function GridHeader<TData>({
  columns,
  sortModel,
  headerHeight,
  multiSortKey,
  onSort,
}: GridHeaderProps<TData>) {
  const handleHeaderClick = (colDef: ColDef<TData>, e: React.MouseEvent) => {
    if (!colDef.sortable) return;
    const colId = getColId(colDef);
    const isMultiSort = multiSortKey === "ctrl" ? e.ctrlKey || e.metaKey : e.shiftKey;
    onSort(colId, isMultiSort);
  };

  const getSortIcon = (colDef: ColDef<TData>) => {
    if (!colDef.sortable) return null;

    const colId = getColId(colDef);
    const sortItem = sortModel.find((s) => s.colId === colId);
    const sortIndex = sortModel.length > 1 ? sortModel.findIndex((s) => s.colId === colId) + 1 : null;

    if (!sortItem) {
      return <ChevronsUpDown className="h-4 w-4 opacity-30" />;
    }

    return (
      <span className="inline-flex items-center gap-0.5">
        {sortItem.sort === "asc" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        {sortIndex && sortIndex > 0 && (
          <span className="text-xs text-muted-foreground">{sortIndex}</span>
        )}
      </span>
    );
  };

  return (
    <TableRow style={{ height: headerHeight }}>
      {columns.map((colDef) => (
        <TableHead
          key={getColId(colDef)}
          className={cn(
            colDef.headerClass,
            colDef.sortable && "cursor-pointer select-none hover:bg-accent/50",
            colDef.pinned === "left" && "sticky left-0 z-10 bg-background",
            colDef.pinned === "right" && "sticky right-0 z-10 bg-background"
          )}
          style={{
            width: colDef.width,
            minWidth: colDef.minWidth,
            maxWidth: colDef.maxWidth,
          }}
          onClick={(e) => handleHeaderClick(colDef, e)}
        >
          <div className="flex items-center gap-1">
            <span className="flex-1">
              {colDef.headerName || colDef.field?.toString() || ""}
            </span>
            {getSortIcon(colDef)}
          </div>
        </TableHead>
      ))}
    </TableRow>
  );
}

