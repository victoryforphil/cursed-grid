"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TableHead, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { ColDef, SortModelItem, FilterModel, TextFilterModel, NumberFilterModel } from "../types";
import { getColId } from "../utils";
import { ColumnMenu } from "./ColumnMenu";

interface GridHeaderProps<TData> {
  columns: ColDef<TData>[];
  sortModel: SortModelItem[];
  filterModel: FilterModel;
  headerHeight: number;
  multiSortKey: "ctrl" | "shift";
  showColumnMenu?: boolean;
  onSort: (colId: string, isMultiSort: boolean) => void;
  onSortDirect?: (colId: string, direction: "asc" | "desc" | null) => void;
  onHideColumn?: (colId: string) => void;
  onPinColumn?: (colId: string, pinned: "left" | "right" | null) => void;
  onFilterChange?: (colId: string, filter: TextFilterModel | NumberFilterModel | null) => void;
}

export function GridHeader<TData>({
  columns,
  sortModel,
  filterModel,
  headerHeight,
  multiSortKey,
  showColumnMenu = true,
  onSort,
  onSortDirect,
  onHideColumn,
  onPinColumn,
  onFilterChange,
}: GridHeaderProps<TData>) {
  const handleHeaderClick = (colDef: ColDef<TData>, e: React.MouseEvent) => {
    if (!colDef.sortable) return;
    const colId = getColId(colDef);
    const isMultiSort = multiSortKey === "ctrl" ? e.ctrlKey || e.metaKey : e.shiftKey;
    onSort(colId, isMultiSort);
  };

  const handleSortDirect = (colId: string, direction: "asc" | "desc" | null) => {
    if (onSortDirect) {
      onSortDirect(colId, direction);
    }
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
            <span className="flex-1 truncate">
              {colDef.headerName || colDef.field?.toString() || ""}
            </span>
            {getSortIcon(colDef)}
            {showColumnMenu && !colDef.suppressMenu && (
              <ColumnMenu
                colDef={colDef}
                sortModel={sortModel}
                filterModel={filterModel}
                onSort={handleSortDirect}
                onHide={onHideColumn || (() => {})}
                onPin={onPinColumn || (() => {})}
                onFilterChange={onFilterChange || (() => {})}
              />
            )}
          </div>
        </TableHead>
      ))}
    </TableRow>
  );
}
