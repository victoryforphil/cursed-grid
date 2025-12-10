"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { ColDef, RowNode } from "../types";
import { getColId, getCellValue, formatCellValue } from "../utils";

interface GridBodyProps<TData> {
  rows: RowNode<TData>[];
  columns: ColDef<TData>[];
  rowHeight: number;
  selectedRowIds: Set<string>;
  rowSelection: "single" | "multiple" | null;
  animateRows: boolean;
  rowClass?: string | ((params: { data: TData; rowIndex: number }) => string);
  onRowClick: (node: RowNode<TData>) => void;
  onCellClick: (node: RowNode<TData>, colDef: ColDef<TData>, value: unknown) => void;
}

export function GridBody<TData>({
  rows,
  columns,
  rowHeight,
  selectedRowIds,
  rowSelection,
  animateRows,
  rowClass,
  onRowClick,
  onCellClick,
}: GridBodyProps<TData>) {
  const getRowClassName = (node: RowNode<TData>): string => {
    if (typeof rowClass === "function") {
      return rowClass({ data: node.data, rowIndex: node.rowIndex });
    }
    return rowClass || "";
  };

  const getCellClassName = (node: RowNode<TData>, colDef: ColDef<TData>): string => {
    const value = getCellValue(node, colDef);
    
    if (typeof colDef.cellClass === "function") {
      return colDef.cellClass({
        value,
        data: node.data,
        colDef,
        node,
        rowIndex: node.rowIndex,
        colId: getColId(colDef),
      });
    }
    
    return colDef.cellClass || "";
  };

  const renderCell = (node: RowNode<TData>, colDef: ColDef<TData>) => {
    const value = getCellValue(node, colDef);
    
    if (colDef.cellRenderer || colDef.cellRendererFramework) {
      const CellComponent = colDef.cellRenderer || colDef.cellRendererFramework;
      if (CellComponent) {
        return (
          <CellComponent
            value={value}
            data={node.data}
            colDef={colDef}
            node={node}
            rowIndex={node.rowIndex}
            colId={getColId(colDef)}
          />
        );
      }
    }
    
    return formatCellValue(node, colDef, value);
  };

  return (
    <TableBody>
      {rows.map((node) => (
        <TableRow
          key={node.id}
          className={cn(
            getRowClassName(node),
            selectedRowIds.has(node.id) && "bg-primary/10",
            rowSelection && "cursor-pointer",
            animateRows && "transition-all duration-200"
          )}
          style={{ height: rowHeight }}
          onClick={() => onRowClick(node)}
          data-state={selectedRowIds.has(node.id) ? "selected" : undefined}
        >
          {columns.map((colDef) => {
            const value = getCellValue(node, colDef);
            return (
              <TableCell
                key={getColId(colDef)}
                className={cn(
                  getCellClassName(node, colDef),
                  colDef.pinned === "left" && "sticky left-0 z-10 bg-background",
                  colDef.pinned === "right" && "sticky right-0 z-10 bg-background"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onCellClick(node, colDef, value);
                  onRowClick(node);
                }}
              >
                {renderCell(node, colDef)}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  );
}

