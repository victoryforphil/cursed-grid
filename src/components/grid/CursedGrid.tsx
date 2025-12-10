"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Table, TableHeader } from "@/components/ui/table";
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
  TextFilterModel,
  NumberFilterModel,
  IServerSideDatasource,
  IServerSideGetRowsRequest,
  IDatasource,
  GridOptions,
  GridState,
} from "./types";
import { useGridState } from "./hooks";
import {
  GridHeader,
  FloatingFilters,
  GridBody,
  GridPagination,
  QuickFilter,
  LoadingOverlay,
  NoRowsOverlay,
  ColumnsPanelButton,
} from "./components";
import { getColId, getCellValue } from "./utils";

// Re-export types for convenience
export * from "./types";

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
  blockLoadDebounceMillis = 0,
  
  // Infinite Scroll
  datasource,
  
  // Sorting
  sortable: globalSortable,
  multiSortKey = "ctrl",
  
  // Filtering
  floatingFilter: globalFloatingFilter = false,
  quickFilterText: externalQuickFilterText,
  
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
  
  // Toolbar
  showColumnsPanel = false,
  showToolbar = false,
  
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
  // GRID STATE (via custom hook)
  // ============================================================================
  const gridState = useGridState({
    rowData: rowData ?? [],
    columnDefs,
    defaultColDef,
    rowModelType,
    getRowId,
    pagination,
    paginationPageSize,
    globalSortable,
    globalFloatingFilter,
    serverSideDatasource,
    datasource,
    externalQuickFilterText,
    debug,
  });

  const {
    selectedRowIds,
    currentPage,
    setCurrentPage,
    sortModel,
    setSortModel,
    filterModel,
    setFilterModel,
    quickFilterText,
    setQuickFilterText,
    floatingFilterValues,
    isLoading,
    setIsLoading,
    totalRowCount,
    setTotalRowCount,
    loadedBlocks,
    setLoadedBlocks,
    serverSideData,
    setServerSideData,
    currentDatasource,
    setCurrentDatasource,
    mergedColumnDefs,
    visibleColumns,
    hasFloatingFilters,
    filteredRowData,
    rowNodes,
    paginatedRowNodes,
    totalPages,
    internalColumnDefs,
    setInternalColumnDefs,
    handleFloatingFilterChange,
    clearFloatingFilter,
    handleSort,
    selectRow,
    selectAll,
    deselectAll,
    log,
  } = gridState;

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
    [currentDatasource, rowModelType, cacheBlockSize, loadedBlocks, filterModel, sortModel, log, setIsLoading, setServerSideData, setTotalRowCount, setLoadedBlocks]
  );

  // Initial data load for server-side/infinite
  React.useEffect(() => {
    if ((rowModelType === "serverSide" || rowModelType === "infinite") && currentDatasource) {
      setServerSideData([]);
      setLoadedBlocks(new Set());
      setTotalRowCount(-1);
      
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
    getRowData: () => rowModelType === "clientSide" ? (rowData ?? []) : serverSideData,
    setRowData: () => log("setRowData called"),
    getSelectedRows: () => rowNodes.filter((node) => selectedRowIds.has(node.id)).map((node) => node.data),
    selectAll,
    deselectAll,
    refreshCells: () => setInternalColumnDefs([...internalColumnDefs]),
    exportDataAsCsv: () => {
      const headers = mergedColumnDefs.filter((col) => !col.hide).map((col) => col.headerName || col.field?.toString() || "");
      const rows = rowNodes.map((node) =>
        mergedColumnDefs.filter((col) => !col.hide).map((col) => {
          const value = col.field ? getCellValue(node, col) : "";
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
    sizeColumnsToFit: () => log("sizeColumnsToFit called"),
    autoSizeAllColumns: () => log("autoSizeAllColumns called"),
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
    setServerSideDatasource: (ds) => setCurrentDatasource(ds),
    refreshServerSide: () => {
      log("refreshServerSide called");
      setLoadedBlocks(new Set());
      setServerSideData([]);
      loadServerSideData(0, cacheBlockSize);
    },
    getDisplayedRowCount: () => rowNodes.length,
    getRowNode: (id) => rowNodes.find((node) => node.id === id),
    setDatasource: (ds) => setCurrentDatasource(ds),
    purgeInfiniteCache: () => {
      setLoadedBlocks(new Set());
      setServerSideData([]);
    },
    refreshInfiniteCache: () => {
      setLoadedBlocks(new Set());
      setServerSideData([]);
      loadServerSideData(0, cacheBlockSize);
    },
    setGridOption: <K extends keyof GridOptions<TData>>(key: K, value: GridOptions<TData>[K]) => {
      log("setGridOption called:", key, value);
      if (key === "serverSideDatasource") setCurrentDatasource(value as IServerSideDatasource<TData>);
      else if (key === "datasource") setCurrentDatasource(value as IDatasource<TData>);
      else if (key === "quickFilterText") setQuickFilterText(value as string);
    },
    
    // Display operations
    ensureIndexVisible: (index, position) => {
      log("ensureIndexVisible called:", index, position);
      // TODO: Implement scroll to index
    },
    ensureColumnVisible: (colId, position) => {
      log("ensureColumnVisible called:", colId, position);
      // TODO: Implement scroll to column
    },
    getAllDisplayedColumns: () => visibleColumns,
    
    // Row grouping
    expandAll: () => {
      log("expandAll called");
      // TODO: Implement when row grouping is added
    },
    collapseAll: () => {
      log("collapseAll called");
      // TODO: Implement when row grouping is added
    },
    setRowNodeExpanded: (node, expanded, recursive) => {
      log("setRowNodeExpanded called:", node.id, expanded, recursive);
      // TODO: Implement when row grouping is added
    },
    forEachNode: (callback) => {
      rowNodes.forEach((node, index) => callback(node, index));
    },
    
    // Selection
    getSelectedNodes: () => rowNodes.filter((node) => selectedRowIds.has(node.id)),
    
    // State persistence
    getState: () => ({
      filter: filterModel,
      sort: sortModel,
      columnState: mergedColumnDefs.map((col) => ({
        colId: getColId(col),
        width: col.width,
        hide: col.hide,
        pinned: col.pinned,
      })),
    }),
    getColumnGroupState: () => {
      log("getColumnGroupState called");
      return [];
    },
    setColumnGroupState: (state) => {
      log("setColumnGroupState called:", state);
      // TODO: Implement when column groups are added
    },
  }), [rowData, rowNodes, selectedRowIds, internalColumnDefs, mergedColumnDefs, visibleColumns, sortModel, filterModel, serverSideData, rowModelType, cacheBlockSize, loadServerSideData, log, selectAll, deselectAll, setInternalColumnDefs, setSortModel, setFilterModel, setLoadedBlocks, setServerSideData, setCurrentDatasource, setQuickFilterText]);

  // ============================================================================
  // COLUMN API
  // ============================================================================
  const columnApi = React.useMemo<ColumnApi<TData>>(() => ({
    getColumns: () => internalColumnDefs,
    setColumnVisible: (colId, visible) => {
      setInternalColumnDefs((prev) =>
        prev.map((col) => getColId(col) === colId ? { ...col, hide: !visible } : col)
      );
    },
    getColumnState: (): ColumnState[] =>
      mergedColumnDefs.map((col) => {
        const colId = getColId(col);
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
          const colState = state.find((s) => s.colId === getColId(col));
          return colState ? { ...col, ...colState } : col;
        })
      );
      const newSortModel: SortModelItem[] = state
        .filter((s) => s.sort)
        .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
        .map((s) => ({ colId: s.colId, sort: s.sort as "asc" | "desc" }));
      setSortModel(newSortModel);
    },
    moveColumn: (colId, toIndex) => {
      setInternalColumnDefs((prev) => {
        const colIndex = prev.findIndex((col) => getColId(col) === colId);
        if (colIndex === -1) return prev;
        const newCols = [...prev];
        const [col] = newCols.splice(colIndex, 1);
        newCols.splice(toIndex, 0, col);
        return newCols;
      });
    },
    setColumnPinned: (colId, pinned) => {
      setInternalColumnDefs((prev) =>
        prev.map((col) => getColId(col) === colId ? { ...col, pinned } : col)
      );
    },
  }), [internalColumnDefs, mergedColumnDefs, sortModel, setInternalColumnDefs, setSortModel]);

  // ============================================================================
  // REFS
  // ============================================================================
  const gridApiRef = React.useRef<GridApi<TData>>(gridApi);
  const columnApiRef = React.useRef<ColumnApi<TData>>(columnApi);
  const rowNodesRef = React.useRef(rowNodes);
  
  React.useEffect(() => { gridApiRef.current = gridApi; }, [gridApi]);
  React.useEffect(() => { columnApiRef.current = columnApi; }, [columnApi]);
  React.useEffect(() => { rowNodesRef.current = rowNodes; }, [rowNodes]);

  // ============================================================================
  // CALLBACKS
  // ============================================================================
  const hasCalledGridReady = React.useRef(false);
  React.useEffect(() => {
    if (onGridReady && !hasCalledGridReady.current) {
      hasCalledGridReady.current = true;
      onGridReady({ api: gridApiRef.current, columnApi: columnApiRef.current });
    }
  }, [onGridReady]);

  const prevSelectedIdsRef = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    const prevIds = prevSelectedIdsRef.current;
    const idsChanged = prevIds.size !== selectedRowIds.size || [...selectedRowIds].some(id => !prevIds.has(id));
    if (idsChanged && onSelectionChanged) {
      onSelectionChanged({
        api: gridApiRef.current,
        columnApi: columnApiRef.current,
        selectedRows: rowNodesRef.current.filter((node) => selectedRowIds.has(node.id)).map((node) => node.data),
      });
    }
    prevSelectedIdsRef.current = new Set(selectedRowIds);
  }, [selectedRowIds, onSelectionChanged]);

  const prevSortModelRef = React.useRef<SortModelItem[]>([]);
  React.useEffect(() => {
    if (JSON.stringify(prevSortModelRef.current) !== JSON.stringify(sortModel) && onSortChanged) {
      onSortChanged({ api: gridApiRef.current, columnApi: columnApiRef.current, source: "uiColumnSorted" });
    }
    prevSortModelRef.current = sortModel;
  }, [sortModel, onSortChanged]);

  const prevFilterModelRef = React.useRef<FilterModel>({});
  React.useEffect(() => {
    if (JSON.stringify(prevFilterModelRef.current) !== JSON.stringify(filterModel) && onFilterChanged) {
      onFilterChanged({ api: gridApiRef.current, columnApi: columnApiRef.current });
    }
    prevFilterModelRef.current = filterModel;
  }, [filterModel, onFilterChanged]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleRowClick = React.useCallback((node: RowNode<TData>) => {
    if (onRowClicked) {
      onRowClicked({ api: gridApiRef.current, columnApi: columnApiRef.current, data: node.data, rowIndex: node.rowIndex, node });
    }
    if (rowSelection && !suppressRowClickSelection) {
      selectRow(node.id, rowSelection);
    }
  }, [onRowClicked, rowSelection, suppressRowClickSelection, selectRow]);

  const handleCellClick = React.useCallback((node: RowNode<TData>, colDef: ColDef<TData>, value: unknown) => {
    if (onCellClicked) {
      onCellClicked({ api: gridApiRef.current, columnApi: columnApiRef.current, data: node.data, value, colDef, rowIndex: node.rowIndex, node });
    }
  }, [onCellClicked]);

  // Column menu handlers
  const handleSortDirect = React.useCallback((colId: string, direction: "asc" | "desc" | null) => {
    if (direction === null) {
      setSortModel(sortModel.filter((s) => s.colId !== colId));
    } else {
      const existing = sortModel.find((s) => s.colId === colId);
      if (existing) {
        setSortModel(sortModel.map((s) => s.colId === colId ? { ...s, sort: direction } : s));
      } else {
        setSortModel([{ colId, sort: direction }]);
      }
    }
    if (rowModelType !== "clientSide") {
      setLoadedBlocks(new Set());
      setServerSideData([]);
    }
  }, [sortModel, rowModelType, setSortModel, setLoadedBlocks, setServerSideData]);

  const handleHideColumn = React.useCallback((colId: string) => {
    setInternalColumnDefs((prev) =>
      prev.map((col) => getColId(col) === colId ? { ...col, hide: true } : col)
    );
  }, [setInternalColumnDefs]);

  const handlePinColumn = React.useCallback((colId: string, pinned: "left" | "right" | null) => {
    setInternalColumnDefs((prev) =>
      prev.map((col) => getColId(col) === colId ? { ...col, pinned } : col)
    );
  }, [setInternalColumnDefs]);

  const handleMenuFilterChange = React.useCallback((colId: string, filter: TextFilterModel | NumberFilterModel | null) => {
    if (filter === null) {
      setFilterModel((prev) => {
        const next = { ...prev };
        delete next[colId];
        return next;
      });
    } else {
      setFilterModel((prev) => ({ ...prev, [colId]: filter }));
    }
    if (rowModelType !== "clientSide") {
      setLoadedBlocks(new Set());
      setServerSideData([]);
    }
  }, [rowModelType, setFilterModel, setLoadedBlocks, setServerSideData]);

  const handleColumnResize = React.useCallback((colId: string, width: number) => {
    setInternalColumnDefs((prev) =>
      prev.map((col) => getColId(col) === colId ? { ...col, width } : col)
    );
  }, [setInternalColumnDefs]);

  // ============================================================================
  // THEME
  // ============================================================================
  const themeClasses: Record<string, string> = {
    cursed: "cursed-grid-theme-cursed",
    alpine: "cursed-grid-theme-alpine",
    balham: "cursed-grid-theme-balham",
    material: "cursed-grid-theme-material",
  };

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
      {/* Toolbar */}
      {(showToolbar || showColumnsPanel || externalQuickFilterText !== undefined) && (
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
          {/* Quick Filter */}
          {externalQuickFilterText !== undefined && (
            <div className="flex-1">
              <QuickFilter
                value={quickFilterText}
                onChange={setQuickFilterText}
              />
            </div>
          )}
          
          {/* Columns Panel Button */}
          {showColumnsPanel && (
            <ColumnsPanelButton
              columns={mergedColumnDefs}
              onColumnVisibilityChange={(colId, visible) => {
                setInternalColumnDefs((prev) =>
                  prev.map((col) => getColId(col) === colId ? { ...col, hide: !visible } : col)
                );
              }}
            />
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {showLoading && <LoadingOverlay message={overlayLoadingTemplate} />}

      {/* No Rows Overlay */}
      {showNoRows && <NoRowsOverlay message={overlayNoRowsTemplate} />}

      {/* Grid Table */}
      {rowNodes.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <GridHeader
                columns={visibleColumns}
                sortModel={sortModel}
                filterModel={filterModel}
                headerHeight={headerHeight}
                multiSortKey={multiSortKey}
                showColumnMenu={true}
                onSort={handleSort}
                onSortDirect={handleSortDirect}
                onHideColumn={handleHideColumn}
                onPinColumn={handlePinColumn}
                onFilterChange={handleMenuFilterChange}
                onColumnResize={handleColumnResize}
              />
              {hasFloatingFilters && (
                <FloatingFilters
                  columns={visibleColumns}
                  filterValues={floatingFilterValues}
                  onFilterChange={handleFloatingFilterChange}
                  onFilterClear={clearFloatingFilter}
                />
              )}
            </TableHeader>
            <GridBody
              rows={paginatedRowNodes}
              columns={visibleColumns}
              rowHeight={rowHeight}
              selectedRowIds={selectedRowIds}
              rowSelection={rowSelection ?? null}
              animateRows={animateRows}
              rowClass={rowClass}
              onRowClick={handleRowClick}
              onCellClick={handleCellClick}
            />
          </Table>

          {/* Pagination */}
          {pagination && (
            <GridPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRowCount={totalRowCount}
              filteredCount={rowModelType === "clientSide" ? filteredRowData.length : undefined}
              originalCount={rowModelType === "clientSide" ? (rowData?.length ?? 0) : undefined}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default CursedGrid;
