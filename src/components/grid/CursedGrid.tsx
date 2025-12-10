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
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from "lucide-react";
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
  SortChangedEvent,
  FilterChangedEvent,
  ColumnState,
  SortModelItem,
  FilterModel,
  IServerSideDatasource,
  IServerSideGetRowsRequest,
  IDatasource,
  GridOptions,
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
  getRowId?: (params: { data: TData }) => string,
  startIndex: number = 0
): RowNode<TData>[] {
  return rowData.map((data, index) => ({
    id: generateRowId(data, startIndex + index, getRowId),
    data,
    rowIndex: startIndex + index,
    isSelected: false,
  }));
}

/**
 * Compare function for sorting
 */
function defaultComparator(valueA: unknown, valueB: unknown): number {
  if (valueA === valueB) return 0;
  if (valueA === null || valueA === undefined) return 1;
  if (valueB === null || valueB === undefined) return -1;
  
  if (typeof valueA === "number" && typeof valueB === "number") {
    return valueA - valueB;
  }
  
  return String(valueA).localeCompare(String(valueB));
}

/**
 * CursedGrid - A high-performance, AG Grid-compatible data grid component
 * Compatible with AG Grid Enterprise 32.3.1
 */
export function CursedGrid<TData = unknown>({
  // Data
  rowData = [],
  columnDefs = [],
  defaultColDef,
  
  // Row Model
  rowModelType = "clientSide",
  
  // Server-Side Row Model
  serverSideDatasource,
  cacheBlockSize = 100,
  serverSideInitialRowCount = 0,
  blockLoadDebounceMillis = 0,
  
  // Infinite Scroll
  datasource,
  infiniteInitialRowCount = 100,
  maxConcurrentDatasourceRequests = 2,
  
  // Sorting
  sortable: globalSortable,
  multiSortKey = "ctrl",
  
  // Layout
  rowHeight = 40,
  headerHeight = 40,
  domLayout = "normal",
  
  // Selection
  rowSelection,
  suppressRowClickSelection = false,
  
  // Pagination
  pagination = false,
  paginationPageSize = 10,
  
  // Appearance
  animateRows = false,
  rowClass,
  theme = "cursed",
  
  // Identification
  getRowId,
  
  // Overlays
  overlayLoadingTemplate = "Loading...",
  overlayNoRowsTemplate = "No rows to display",
  
  // Callbacks
  onGridReady,
  onSelectionChanged,
  onCellClicked,
  onRowClicked,
  onSortChanged,
  onFilterChanged,
  
  // React props
  className,
  style,
  loading: externalLoading = false,
  debug = false,
}: CursedGridProps<TData>) {
  // ============================================================================
  // STATE
  // ============================================================================
  const [selectedRowIds, setSelectedRowIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(0);
  const [internalColumnDefs, setInternalColumnDefs] = React.useState<ColDef<TData>[]>(columnDefs);
  const [sortModel, setSortModel] = React.useState<SortModelItem[]>([]);
  const [filterModel, setFilterModel] = React.useState<FilterModel>({});
  
  // Server-side / Infinite scroll state
  const [serverSideData, setServerSideData] = React.useState<TData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [totalRowCount, setTotalRowCount] = React.useState<number>(-1);
  const [loadedBlocks, setLoadedBlocks] = React.useState<Set<number>>(new Set());
  const [currentDatasource, setCurrentDatasource] = React.useState<
    IServerSideDatasource<TData> | IDatasource<TData> | null
  >(serverSideDatasource || datasource || null);

  // Debug logging
  const log = React.useCallback(
    (...args: unknown[]) => {
      if (debug) {
        console.log("[CursedGrid]", ...args);
      }
    },
    [debug]
  );

  // ============================================================================
  // SYNC EXTERNAL PROPS
  // ============================================================================
  React.useEffect(() => {
    setInternalColumnDefs(columnDefs);
  }, [columnDefs]);

  React.useEffect(() => {
    if (serverSideDatasource) {
      setCurrentDatasource(serverSideDatasource);
    } else if (datasource) {
      setCurrentDatasource(datasource);
    }
  }, [serverSideDatasource, datasource]);

  // ============================================================================
  // MERGED COLUMN DEFINITIONS
  // ============================================================================
  const mergedColumnDefs = React.useMemo(() => {
    return internalColumnDefs.map((colDef, index) => ({
      ...defaultColDef,
      ...colDef,
      colId: colDef.colId || colDef.field?.toString() || `col-${index}`,
      sortable: colDef.sortable ?? globalSortable ?? defaultColDef?.sortable ?? false,
    }));
  }, [internalColumnDefs, defaultColDef, globalSortable]);

  // ============================================================================
  // CLIENT-SIDE SORTING
  // ============================================================================
  const sortedRowData = React.useMemo(() => {
    if (rowModelType !== "clientSide" || sortModel.length === 0) {
      return rowData ?? [];
    }

    const data = [...(rowData ?? [])];
    
    data.sort((a, b) => {
      for (const sort of sortModel) {
        const colDef = mergedColumnDefs.find(
          (col) => (col.colId || col.field?.toString()) === sort.colId
        );
        
        if (!colDef) continue;
        
        const valueA = colDef.field ? getFieldValue(a, colDef.field.toString()) : undefined;
        const valueB = colDef.field ? getFieldValue(b, colDef.field.toString()) : undefined;
        
        const comparator = colDef.comparator || defaultComparator;
        let result = comparator(
          valueA,
          valueB,
          { id: "", data: a, rowIndex: 0, isSelected: false },
          { id: "", data: b, rowIndex: 0, isSelected: false }
        );
        
        if (sort.sort === "desc") {
          result = -result;
        }
        
        if (result !== 0) return result;
      }
      return 0;
    });

    return data;
  }, [rowData, sortModel, mergedColumnDefs, rowModelType]);

  // ============================================================================
  // ROW NODES
  // ============================================================================
  const rowNodes = React.useMemo(() => {
    if (rowModelType === "serverSide" || rowModelType === "infinite") {
      return createRowNodes(serverSideData, getRowId);
    }
    return createRowNodes(sortedRowData, getRowId);
  }, [rowModelType, serverSideData, sortedRowData, getRowId]);

  // ============================================================================
  // PAGINATION
  // ============================================================================
  const paginatedRowNodes = React.useMemo(() => {
    if (!pagination) return rowNodes;
    const start = currentPage * paginationPageSize;
    return rowNodes.slice(start, start + paginationPageSize);
  }, [rowNodes, pagination, currentPage, paginationPageSize]);

  const totalPages = Math.ceil(
    (totalRowCount > 0 ? totalRowCount : rowNodes.length) / paginationPageSize
  );

  // ============================================================================
  // SERVER-SIDE DATA LOADING
  // ============================================================================
  const loadServerSideData = React.useCallback(
    async (startRow: number, endRow: number) => {
      if (!currentDatasource || rowModelType === "clientSide") return;

      const blockIndex = Math.floor(startRow / cacheBlockSize);
      
      if (loadedBlocks.has(blockIndex)) {
        log("Block already loaded:", blockIndex);
        return;
      }

      setIsLoading(true);
      log("Loading data:", { startRow, endRow, blockIndex });

      const request: IServerSideGetRowsRequest = {
        startRow,
        endRow,
        rowGroupCols: [],
        valueCols: [],
        pivotCols: [],
        pivotMode: false,
        groupKeys: [],
        filterModel,
        sortModel,
      };

      if (rowModelType === "serverSide" && "getRows" in currentDatasource) {
        const ds = currentDatasource as IServerSideDatasource<TData>;
        ds.getRows({
          request,
          parentNode: null,
          success: ({ rowData: newData, rowCount }) => {
            log("Server-side data loaded:", { count: newData.length, rowCount });
            setServerSideData((prev) => {
              const updated = [...prev];
              newData.forEach((item, i) => {
                updated[startRow + i] = item;
              });
              return updated;
            });
            if (rowCount !== undefined && rowCount >= 0) {
              setTotalRowCount(rowCount);
            }
            setLoadedBlocks((prev) => new Set(prev).add(blockIndex));
            setIsLoading(false);
          },
          fail: () => {
            log("Server-side data load failed");
            setIsLoading(false);
          },
          api: gridApiRef.current,
          columnApi: columnApiRef.current,
        });
      } else if (rowModelType === "infinite" && "getRows" in currentDatasource) {
        const ds = currentDatasource as IDatasource<TData>;
        ds.getRows({
          startRow,
          endRow,
          sortModel,
          filterModel,
          successCallback: (newData, lastRow) => {
            log("Infinite data loaded:", { count: newData.length, lastRow });
            setServerSideData((prev) => {
              const updated = [...prev];
              newData.forEach((item, i) => {
                updated[startRow + i] = item;
              });
              return updated;
            });
            if (lastRow !== undefined && lastRow >= 0) {
              setTotalRowCount(lastRow);
            }
            setLoadedBlocks((prev) => new Set(prev).add(blockIndex));
            setIsLoading(false);
          },
          failCallback: () => {
            log("Infinite data load failed");
            setIsLoading(false);
          },
        });
      }
    },
    [currentDatasource, rowModelType, cacheBlockSize, loadedBlocks, filterModel, sortModel, log]
  );

  // Initial data load for server-side/infinite
  React.useEffect(() => {
    if ((rowModelType === "serverSide" || rowModelType === "infinite") && currentDatasource) {
      // Reset state when datasource changes
      setServerSideData([]);
      setLoadedBlocks(new Set());
      setTotalRowCount(-1);
      
      // Load first block
      const debounceTimer = setTimeout(() => {
        loadServerSideData(0, cacheBlockSize);
      }, blockLoadDebounceMillis);

      return () => clearTimeout(debounceTimer);
    }
  }, [rowModelType, currentDatasource, cacheBlockSize, blockLoadDebounceMillis, sortModel, filterModel]);

  // ============================================================================
  // GRID API
  // ============================================================================
  const gridApi = React.useMemo<GridApi<TData>>(() => ({
    getRowData: () => {
      if (rowModelType === "clientSide") {
        return rowData ?? [];
      }
      return serverSideData;
    },
    setRowData: (data) => {
      if (rowModelType === "clientSide") {
        log("setRowData called - updating internal data");
        // For client-side, this would need parent to update rowData prop
      }
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
      log("sizeColumnsToFit called");
    },
    autoSizeAllColumns: () => {
      log("autoSizeAllColumns called");
    },
    
    // Sorting & Filtering
    getSortModel: () => sortModel,
    setSortModel: (newSortModel) => {
      setSortModel(newSortModel);
      if (rowModelType !== "clientSide") {
        setLoadedBlocks(new Set());
        setServerSideData([]);
      }
    },
    getFilterModel: () => filterModel,
    setFilterModel: (newFilterModel) => {
      setFilterModel(newFilterModel ?? {});
      if (rowModelType !== "clientSide") {
        setLoadedBlocks(new Set());
        setServerSideData([]);
      }
    },
    
    // Server-side
    setServerSideDatasource: (ds) => {
      setCurrentDatasource(ds);
    },
    refreshServerSide: (params) => {
      log("refreshServerSide called", params);
      setLoadedBlocks(new Set());
      setServerSideData([]);
      loadServerSideData(0, cacheBlockSize);
    },
    getDisplayedRowCount: () => rowNodes.length,
    getRowNode: (id) => rowNodes.find((node) => node.id === id),
    
    // Infinite scroll
    setDatasource: (ds) => {
      setCurrentDatasource(ds);
    },
    purgeInfiniteCache: () => {
      setLoadedBlocks(new Set());
      setServerSideData([]);
    },
    refreshInfiniteCache: () => {
      setLoadedBlocks(new Set());
      setServerSideData([]);
      loadServerSideData(0, cacheBlockSize);
    },
    
    // Generic setter
    setGridOption: <K extends keyof GridOptions<TData>>(key: K, value: GridOptions<TData>[K]) => {
      log("setGridOption called:", key, value);
      if (key === "serverSideDatasource") {
        setCurrentDatasource(value as IServerSideDatasource<TData>);
      } else if (key === "datasource") {
        setCurrentDatasource(value as IDatasource<TData>);
      }
    },
  }), [
    rowData,
    rowNodes,
    selectedRowIds,
    internalColumnDefs,
    mergedColumnDefs,
    sortModel,
    filterModel,
    serverSideData,
    rowModelType,
    cacheBlockSize,
    loadServerSideData,
    log,
  ]);

  // ============================================================================
  // COLUMN API
  // ============================================================================
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
      mergedColumnDefs.map((col) => {
        const colId = col.colId || col.field?.toString() || "";
        const sortItem = sortModel.find((s) => s.colId === colId);
        return {
          colId,
          width: col.width,
          hide: col.hide,
          pinned: col.pinned,
          sort: sortItem?.sort ?? null,
          sortIndex: sortItem ? sortModel.indexOf(sortItem) : undefined,
        };
      }),
    applyColumnState: (state) => {
      setInternalColumnDefs((prev) =>
        prev.map((col) => {
          const colState = state.find(
            (s) => s.colId === (col.colId || col.field?.toString())
          );
          return colState ? { ...col, ...colState } : col;
        })
      );
      // Apply sort from column state
      const newSortModel: SortModelItem[] = state
        .filter((s) => s.sort)
        .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
        .map((s) => ({ colId: s.colId, sort: s.sort as "asc" | "desc" }));
      setSortModel(newSortModel);
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
  }), [internalColumnDefs, mergedColumnDefs, sortModel]);

  // ============================================================================
  // REFS
  // ============================================================================
  const gridApiRef = React.useRef<GridApi<TData>>(gridApi);
  const columnApiRef = React.useRef<ColumnApi<TData>>(columnApi);
  const rowNodesRef = React.useRef(rowNodes);
  
  React.useEffect(() => {
    gridApiRef.current = gridApi;
  }, [gridApi]);
  
  React.useEffect(() => {
    columnApiRef.current = columnApi;
  }, [columnApi]);
  
  React.useEffect(() => {
    rowNodesRef.current = rowNodes;
  }, [rowNodes]);

  // ============================================================================
  // CALLBACKS
  // ============================================================================
  
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

  // Handle selection change
  const prevSelectedIdsRef = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
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

  // Handle sort change
  const prevSortModelRef = React.useRef<SortModelItem[]>([]);
  React.useEffect(() => {
    const changed = JSON.stringify(prevSortModelRef.current) !== JSON.stringify(sortModel);
    if (changed && onSortChanged) {
      const event: SortChangedEvent<TData> = {
        api: gridApiRef.current,
        columnApi: columnApiRef.current,
        source: "uiColumnSorted",
      };
      onSortChanged(event);
    }
    prevSortModelRef.current = sortModel;
  }, [sortModel, onSortChanged]);

  // Handle filter change
  const prevFilterModelRef = React.useRef<FilterModel>({});
  React.useEffect(() => {
    const changed = JSON.stringify(prevFilterModelRef.current) !== JSON.stringify(filterModel);
    if (changed && onFilterChanged) {
      const event: FilterChangedEvent<TData> = {
        api: gridApiRef.current,
        columnApi: columnApiRef.current,
      };
      onFilterChanged(event);
    }
    prevFilterModelRef.current = filterModel;
  }, [filterModel, onFilterChanged]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

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

  const handleHeaderClick = (colDef: ColDef<TData>, e: React.MouseEvent) => {
    if (!colDef.sortable) return;

    const colId = colDef.colId || colDef.field?.toString() || "";
    const currentSort = sortModel.find((s) => s.colId === colId);
    const isMultiSort = multiSortKey === "ctrl" ? e.ctrlKey || e.metaKey : e.shiftKey;

    let newSortModel: SortModelItem[];

    if (isMultiSort) {
      // Multi-sort: add or modify this column in the sort model
      if (!currentSort) {
        newSortModel = [...sortModel, { colId, sort: "asc" }];
      } else if (currentSort.sort === "asc") {
        newSortModel = sortModel.map((s) =>
          s.colId === colId ? { ...s, sort: "desc" as const } : s
        );
      } else {
        // Remove from sort
        newSortModel = sortModel.filter((s) => s.colId !== colId);
      }
    } else {
      // Single sort: replace the entire sort model
      if (!currentSort) {
        newSortModel = [{ colId, sort: "asc" }];
      } else if (currentSort.sort === "asc") {
        newSortModel = [{ colId, sort: "desc" }];
      } else {
        newSortModel = [];
      }
    }

    setSortModel(newSortModel);
    
    // For server-side, reset cache and reload
    if (rowModelType !== "clientSide") {
      setLoadedBlocks(new Set());
      setServerSideData([]);
    }
  };

  // ============================================================================
  // CELL RENDERING HELPERS
  // ============================================================================

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

  const getRowClass = (node: RowNode<TData>): string => {
    if (typeof rowClass === "function") {
      return rowClass({ data: node.data, rowIndex: node.rowIndex });
    }
    return rowClass || "";
  };

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

  // ============================================================================
  // SORT INDICATOR
  // ============================================================================
  const getSortIcon = (colDef: ColDef<TData>) => {
    if (!colDef.sortable) return null;

    const colId = colDef.colId || colDef.field?.toString() || "";
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
        {sortIndex && <span className="text-xs text-muted-foreground">{sortIndex}</span>}
      </span>
    );
  };

  // ============================================================================
  // THEME CLASSES
  // ============================================================================
  const themeClasses: Record<string, string> = {
    cursed: "cursed-grid-theme-cursed",
    alpine: "cursed-grid-theme-alpine",
    balham: "cursed-grid-theme-balham",
    material: "cursed-grid-theme-material",
  };

  // ============================================================================
  // VISIBLE COLUMNS
  // ============================================================================
  const visibleColumns = mergedColumnDefs.filter((col) => !col.hide);

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  const showLoading = externalLoading || isLoading;
  const showNoRows = !showLoading && rowNodes.length === 0;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      className={cn(
        "cursed-grid relative overflow-auto",
        themeClasses[theme],
        domLayout === "autoHeight" && "h-auto",
        domLayout === "normal" && "h-full",
        className
      )}
      style={style}
    >
      {/* Loading Overlay */}
      {showLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {overlayLoadingTemplate}
          </div>
        </div>
      )}

      {/* No Rows Overlay */}
      {showNoRows && (
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(node, colDef, value);
                          handleRowClick(node);
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
                {totalRowCount > 0 && ` (${totalRowCount} total rows)`}
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
