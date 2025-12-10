"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Check } from "lucide-react";
import type { ColDef, RowNode } from "../types";
import { getColId, getCellValue, formatCellValue } from "../utils";

interface GridBodyProps<TData> {
  rows: RowNode<TData>[];
  columns: ColDef<TData>[];
  rowHeight: number;
  selectedRowIds: Set<string>;
  rowSelection: "single" | "multiple" | null;
  animateRows: boolean;
  enableCellTextSelection?: boolean;
  rowClass?: string | ((params: { data: TData; rowIndex: number }) => string);
  onRowClick: (node: RowNode<TData>) => void;
  onRowDoubleClick?: (node: RowNode<TData>) => void;
  onCellClick: (node: RowNode<TData>, colDef: ColDef<TData>, value: unknown) => void;
  onCheckboxChange?: (node: RowNode<TData>, checked: boolean) => void;
}

export function GridBody<TData>({
  rows,
  columns,
  rowHeight,
  selectedRowIds,
  rowSelection,
  animateRows,
  enableCellTextSelection,
  rowClass,
  onRowClick,
  onRowDoubleClick,
  onCellClick,
  onCheckboxChange,
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

  const getCellStyle = (node: RowNode<TData>, colDef: ColDef<TData>): React.CSSProperties => {
    if (!colDef.cellStyle) return {};
    
    if (typeof colDef.cellStyle === "function") {
      const value = getCellValue(node, colDef);
      return colDef.cellStyle({
        value,
        data: node.data,
        colDef,
        node,
        rowIndex: node.rowIndex,
        colId: getColId(colDef),
      });
    }
    
    return colDef.cellStyle;
  };

  const getTooltip = (node: RowNode<TData>, colDef: ColDef<TData>): string | undefined => {
    if (colDef.tooltipValueGetter) {
      const value = getCellValue(node, colDef);
      return colDef.tooltipValueGetter({ value, data: node.data, node });
    }
    
    if (colDef.tooltipField) {
      const data = node.data as Record<string, unknown>;
      return String(data[colDef.tooltipField] ?? "");
    }
    
    return undefined;
  };

  const shouldShowCheckbox = (node: RowNode<TData>, colDef: ColDef<TData>): boolean => {
    if (!colDef.checkboxSelection) return false;
    
    if (typeof colDef.checkboxSelection === "function") {
      const value = getCellValue(node, colDef);
      return colDef.checkboxSelection({
        value,
        data: node.data,
        colDef,
        node,
        rowIndex: node.rowIndex,
        colId: getColId(colDef),
      });
    }
    
    return true;
  };

  const renderCheckbox = (node: RowNode<TData>) => {
    const isSelected = selectedRowIds.has(node.id);
    
    return (
      <div
        className={cn(
          "flex items-center justify-center w-4 h-4 border rounded cursor-pointer",
          isSelected ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onCheckboxChange?.(node, !isSelected);
        }}
      >
        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
    );
  };

  const renderCell = (node: RowNode<TData>, colDef: ColDef<TData>) => {
    const value = getCellValue(node, colDef);
    const showCheckbox = shouldShowCheckbox(node, colDef);
    
    const cellContent = (() => {
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
    })();
    
    if (showCheckbox) {
      return (
        <div className="flex items-center gap-2">
          {renderCheckbox(node)}
          {cellContent}
        </div>
      );
    }
    
    return cellContent;
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
            animateRows && "transition-all duration-200",
            enableCellTextSelection && "select-text"
          )}
          style={{ height: rowHeight }}
          onClick={() => onRowClick(node)}
          onDoubleClick={() => onRowDoubleClick?.(node)}
          data-state={selectedRowIds.has(node.id) ? "selected" : undefined}
        >
          {columns.map((colDef) => {
            const value = getCellValue(node, colDef);
            const tooltip = getTooltip(node, colDef);
            
            return (
              <TableCell
                key={getColId(colDef)}
                className={cn(
                  getCellClassName(node, colDef),
                  colDef.pinned === "left" && "sticky left-0 z-10 bg-background",
                  colDef.pinned === "right" && "sticky right-0 z-10 bg-background",
                  enableCellTextSelection && "select-text"
                )}
                style={getCellStyle(node, colDef)}
                title={tooltip}
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
