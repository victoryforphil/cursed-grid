"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CursedGridProps,
  ColDef,
  RowNode,
  GridApi,
  ColumnApi,
  GridReadyEvent,
  CellClickedEvent,
  RowClickedEvent,
  SelectionChangedEvent,
  ColumnState,
} from "./types";

// Re-export types for convenience
export * from "./types";

/**
 * Get value from row data using field path
 */
function getFieldValue<TData>(data: TData, field: string): unknown {
  if (!field) return undefined;
  
  const parts = field.split(".");
  let value: unknown = data;
  
  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  
  return value;
}

/**
 * Generate a unique row ID
 */
function generateRowId<TData>(
  data: TData,
  index: number,
  getRowId?: (params: { data: TData }) => string
): string {
  if (getRowId) {
    return getRowId({ data });
  }
  return `row-${index}`;
}

/**
 * Create row nodes from row data
 */
function createRowNodes<TData>(
  rowData: TData[],
  getRowId?: (params: { data: TData }) => string
): RowNode<TData>[] {
  return rowData.map((data, index) => ({
    id: generateRowId(data, index, getRowId),
    data,
    rowIndex: index,
    isSelected: false,
  }));
}

/**
 * CursedGrid - A high-performance, AG Grid-compatible data grid component
 */
export function CursedGrid<TData = unknown>({
  rowData = [],
  columnDefs = [],
  defaultColDef,
  rowHeight = 40,
  headerHeight = 40,
  rowSelection,
  suppressRowClickSelection = false,
  pagination = false,
  paginationPageSize = 10,
  animateRows = false,
  rowClass,
  getRowId,
  onGridReady,
  onSelectionChanged,
  onCellClicked,
  onRowClicked,
  overlayLoadingTemplate = "Loading...",
  overlayNoRowsTemplate = "No rows to display",
  domLayout = "normal",
  theme = "cursed",
  className,
  style,
  loading = false,
}: CursedGridProps<TData>) {
  // State
  const [selectedRowIds, setSelectedRowIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(0);
  const [internalColumnDefs, setInternalColumnDefs] = React.useState<ColDef<TData>[]>(columnDefs);
  
  // Row nodes
  const rowNodes = React.useMemo(
    () => createRowNodes(rowData ?? [], getRowId),
    [rowData, getRowId]
  );

  // Merged column definitions with defaults
  const mergedColumnDefs = React.useMemo(() => {
    return internalColumnDefs.map((colDef, index) => ({
      ...defaultColDef,
      ...colDef,
      colId: colDef.colId || colDef.field?.toString() || `col-${index}`,
    }));
  }, [internalColumnDefs, defaultColDef]);

  // Pagination
  const paginatedRowNodes = React.useMemo(() => {
    if (!pagination) return rowNodes;
    const start = currentPage * paginationPageSize;
    return rowNodes.slice(start, start + paginationPageSize);
  }, [rowNodes, pagination, currentPage, paginationPageSize]);

  const totalPages = Math.ceil(rowNodes.length / paginationPageSize);

  // Grid API
  const gridApi = React.useMemo<GridApi<TData>>(() => ({
    getRowData: () => rowData ?? [],
    setRowData: () => {
      // In a real implementation, this would update the internal state
      console.warn("setRowData is not fully implemented in this version");
    },
    getSelectedRows: () => {
      return rowNodes
        .filter((node) => selectedRowIds.has(node.id))
        .map((node) => node.data);
    },
    selectAll: () => {
      setSelectedRowIds(new Set(rowNodes.map((node) => node.id)));
    },
    deselectAll: () => {
      setSelectedRowIds(new Set());
    },
    refreshCells: () => {
      // Trigger re-render
      setInternalColumnDefs([...internalColumnDefs]);
    },
    exportDataAsCsv: () => {
      const headers = mergedColumnDefs
        .filter((col) => !col.hide)
        .map((col) => col.headerName || col.field?.toString() || "");
      
      const rows = rowNodes.map((node) =>
        mergedColumnDefs
          .filter((col) => !col.hide)
          .map((col) => {
            const value = col.field ? getFieldValue(node.data, col.field.toString()) : "";
            return String(value ?? "");
          })
      );
      
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.csv";
      a.click();
      URL.revokeObjectURL(url);
    },
    getColumnDefs: () => internalColumnDefs,
    setColumnDefs: (colDefs) => setInternalColumnDefs(colDefs),
    sizeColumnsToFit: () => {
      // In a real implementation, this would resize columns
      console.warn("sizeColumnsToFit is not fully implemented in this version");
    },
    autoSizeAllColumns: () => {
      // In a real implementation, this would auto-size columns
      console.warn("autoSizeAllColumns is not fully implemented in this version");
    },
  }), [rowData, rowNodes, selectedRowIds, internalColumnDefs, mergedColumnDefs]);

  // Column API
  const columnApi = React.useMemo<ColumnApi<TData>>(() => ({
    getColumns: () => internalColumnDefs,
    setColumnVisible: (colId, visible) => {
      setInternalColumnDefs((prev) =>
        prev.map((col) =>
          (col.colId || col.field?.toString()) === colId
            ? { ...col, hide: !visible }
            : col
        )
      );
    },
    getColumnState: (): ColumnState[] =>
      mergedColumnDefs.map((col) => ({
        colId: col.colId || col.field?.toString() || "",
        width: col.width,
        hide: col.hide,
        pinned: col.pinned,
      })),
    applyColumnState: (state) => {
      setInternalColumnDefs((prev) =>
        prev.map((col) => {
          const colState = state.find(
            (s) => s.colId === (col.colId || col.field?.toString())
          );
          return colState ? { ...col, ...colState } : col;
        })
      );
    },
    moveColumn: (colId, toIndex) => {
      setInternalColumnDefs((prev) => {
        const colIndex = prev.findIndex(
          (col) => (col.colId || col.field?.toString()) === colId
        );
        if (colIndex === -1) return prev;
        const newCols = [...prev];
        const [col] = newCols.splice(colIndex, 1);
        newCols.splice(toIndex, 0, col);
        return newCols;
      });
    },
    setColumnPinned: (colId, pinned) => {
      setInternalColumnDefs((prev) =>
        prev.map((col) =>
          (col.colId || col.field?.toString()) === colId
            ? { ...col, pinned }
            : col
        )
      );
    },
  }), [internalColumnDefs, mergedColumnDefs]);

  // Refs for stable references
  const gridApiRef = React.useRef<GridApi<TData>>(gridApi);
  const columnApiRef = React.useRef<ColumnApi<TData>>(columnApi);
  const rowNodesRef = React.useRef(rowNodes);
  
  // Sync refs in effects
  React.useEffect(() => {
    gridApiRef.current = gridApi;
  }, [gridApi]);
  
  React.useEffect(() => {
    columnApiRef.current = columnApi;
  }, [columnApi]);
  
  React.useEffect(() => {
    rowNodesRef.current = rowNodes;
  }, [rowNodes]);

  // Fire onGridReady - only on mount
  const hasCalledGridReady = React.useRef(false);
  React.useEffect(() => {
    if (onGridReady && !hasCalledGridReady.current) {
      hasCalledGridReady.current = true;
      const event: GridReadyEvent<TData> = {
        api: gridApiRef.current,
        columnApi: columnApiRef.current,
      };
      onGridReady(event);
    }
  }, [onGridReady]);

  // Handle selection change - only when selectedRowIds changes, not on other dependencies
  const prevSelectedIdsRef = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    // Only call if selectedRowIds actually changed (compare size and contents)
    const prevIds = prevSelectedIdsRef.current;
    const currentIds = selectedRowIds;
    
    const idsChanged = prevIds.size !== currentIds.size || 
      [...currentIds].some(id => !prevIds.has(id));
    
    if (idsChanged && onSelectionChanged) {
      const selectedRows = rowNodesRef.current
        .filter((node) => selectedRowIds.has(node.id))
        .map((node) => node.data);
      
      const event: SelectionChangedEvent<TData> = {
        api: gridApiRef.current,
        columnApi: columnApiRef.current,
        selectedRows,
      };
      onSelectionChanged(event);
    }
    
    prevSelectedIdsRef.current = new Set(selectedRowIds);
  }, [selectedRowIds, onSelectionChanged]);

  // Handle row click
  const handleRowClick = (node: RowNode<TData>) => {
    if (onRowClicked) {
      const event: RowClickedEvent<TData> = {
        api: gridApiRef.current,
        columnApi: columnApiRef.current,
        data: node.data,
        rowIndex: node.rowIndex,
        node,
      };
      onRowClicked(event);
    }

    if (rowSelection && !suppressRowClickSelection) {
      if (rowSelection === "single") {
        setSelectedRowIds(new Set([node.id]));
      } else if (rowSelection === "multiple") {
        setSelectedRowIds((prev) => {
          const next = new Set(prev);
          if (next.has(node.id)) {
            next.delete(node.id);
          } else {
            next.add(node.id);
          }
          return next;
        });
      }
    }
  };

  // Handle cell click
  const handleCellClick = (
    node: RowNode<TData>,
    colDef: ColDef<TData>,
    value: unknown
  ) => {
    if (onCellClicked) {
      const event: CellClickedEvent<TData> = {
        api: gridApiRef.current,
        columnApi: columnApiRef.current,
        data: node.data,
        value,
        colDef,
        rowIndex: node.rowIndex,
        node,
      };
      onCellClicked(event);
    }
  };

  // Get cell value
  const getCellValue = (node: RowNode<TData>, colDef: ColDef<TData>): unknown => {
    if (colDef.valueGetter) {
      return colDef.valueGetter({
        data: node.data,
        colDef,
        node,
        colId: colDef.colId || colDef.field?.toString() || "",
      });
    }
    
    if (colDef.field) {
      return getFieldValue(node.data, colDef.field.toString());
    }
    
    return undefined;
  };

  // Format cell value
  const formatCellValue = (
    node: RowNode<TData>,
    colDef: ColDef<TData>,
    value: unknown
  ): string => {
    if (colDef.valueFormatter) {
      return colDef.valueFormatter({
        value,
        data: node.data,
        colDef,
        node,
        colId: colDef.colId || colDef.field?.toString() || "",
      });
    }
    
    if (value === null || value === undefined) {
      return "";
    }
    
    return String(value);
  };

  // Render cell
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
            colId={colDef.colId || colDef.field?.toString() || ""}
          />
        );
      }
    }
    
    return formatCellValue(node, colDef, value);
  };

  // Get row class
  const getRowClass = (node: RowNode<TData>): string => {
    if (typeof rowClass === "function") {
      return rowClass({ data: node.data, rowIndex: node.rowIndex });
    }
    return rowClass || "";
  };

  // Get cell class
  const getCellClass = (node: RowNode<TData>, colDef: ColDef<TData>): string => {
    const value = getCellValue(node, colDef);
    
    if (typeof colDef.cellClass === "function") {
      return colDef.cellClass({
        value,
        data: node.data,
        colDef,
        node,
        rowIndex: node.rowIndex,
        colId: colDef.colId || colDef.field?.toString() || "",
      });
    }
    
    return colDef.cellClass || "";
  };

  // Theme classes
  const themeClasses: Record<string, string> = {
    cursed: "cursed-grid-theme-cursed",
    alpine: "cursed-grid-theme-alpine",
    balham: "cursed-grid-theme-balham",
    material: "cursed-grid-theme-material",
  };

  // Visible columns
  const visibleColumns = mergedColumnDefs.filter((col) => !col.hide);

  return (
    <div
      className={cn(
        "cursed-grid",
        themeClasses[theme],
        domLayout === "autoHeight" && "h-auto",
        domLayout === "normal" && "h-full",
        className
      )}
      style={style}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-muted-foreground">{overlayLoadingTemplate}</div>
        </div>
      )}

      {/* No Rows Overlay */}
      {!loading && rowNodes.length === 0 && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          {overlayNoRowsTemplate}
        </div>
      )}

      {/* Grid Table */}
      {rowNodes.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow style={{ height: headerHeight }}>
                {visibleColumns.map((colDef) => (
                  <TableHead
                    key={colDef.colId || colDef.field?.toString()}
                    className={cn(
                      colDef.headerClass,
                      colDef.pinned === "left" && "sticky left-0 z-10 bg-background",
                      colDef.pinned === "right" && "sticky right-0 z-10 bg-background"
                    )}
                    style={{
                      width: colDef.width,
                      minWidth: colDef.minWidth,
                      maxWidth: colDef.maxWidth,
                    }}
                  >
                    {colDef.headerName || colDef.field?.toString() || ""}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRowNodes.map((node) => (
                <TableRow
                  key={node.id}
                  className={cn(
                    getRowClass(node),
                    selectedRowIds.has(node.id) && "bg-primary/10",
                    rowSelection && "cursor-pointer",
                    animateRows && "transition-all duration-200"
                  )}
                  style={{ height: rowHeight }}
                  onClick={() => handleRowClick(node)}
                  data-state={selectedRowIds.has(node.id) ? "selected" : undefined}
                >
                  {visibleColumns.map((colDef) => {
                    const value = getCellValue(node, colDef);
                    return (
                      <TableCell
                        key={colDef.colId || colDef.field?.toString()}
                        className={cn(
                          getCellClass(node, colDef),
                          colDef.pinned === "left" && "sticky left-0 z-10 bg-background",
                          colDef.pinned === "right" && "sticky right-0 z-10 bg-background"
                        )}
                        onClick={() => {
                          handleCellClick(node, colDef, value);
                          // Note: Row click is handled by the TableRow onClick
                        }}
                      >
                        {renderCell(node, colDef)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 text-sm border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 text-sm border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CursedGrid;
