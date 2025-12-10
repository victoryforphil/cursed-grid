/**
 * Grid State Hook
 * Manages core grid state: selection, pagination, sorting, filtering
 */

import * as React from "react";
import type {
  ColDef,
  SortModelItem,
  FilterModel,
  RowNode,
  IServerSideDatasource,
  IDatasource,
  TextFilterModel,
  NumberFilterModel,
  SetFilterModel,
} from "../types";
import { createRowNodes, getFieldValue, passesFilter, defaultComparator, getColId } from "../utils";

export interface GridStateOptions<TData> {
  rowData: TData[];
  columnDefs: ColDef<TData>[];
  defaultColDef?: Partial<ColDef<TData>>;
  rowModelType: "clientSide" | "serverSide" | "infinite";
  getRowId?: (params: { data: TData }) => string;
  pagination: boolean;
  paginationPageSize: number;
  globalSortable?: boolean;
  globalFloatingFilter?: boolean;
  serverSideDatasource?: IServerSideDatasource<TData>;
  datasource?: IDatasource<TData>;
  externalQuickFilterText?: string;
  debug?: boolean;
}

export function useGridState<TData>(options: GridStateOptions<TData>) {
  const {
    rowData,
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
  } = options;

  // Debug logger
  const log = React.useCallback(
    (...args: unknown[]) => {
      if (debug) {
        console.log("[CursedGrid]", ...args);
      }
    },
    [debug]
  );

  // ============================================================================
  // CORE STATE
  // ============================================================================
  const [selectedRowIds, setSelectedRowIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(0);
  const [internalColumnDefs, setInternalColumnDefs] = React.useState<ColDef<TData>[]>(columnDefs);
  const [sortModel, setSortModel] = React.useState<SortModelItem[]>([]);
  const [filterModel, setFilterModel] = React.useState<FilterModel>({});
  const [quickFilterText, setQuickFilterText] = React.useState(externalQuickFilterText ?? "");
  const [floatingFilterValues, setFloatingFilterValues] = React.useState<Record<string, string>>({});

  // Server-side state
  const [serverSideData, setServerSideData] = React.useState<TData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [totalRowCount, setTotalRowCount] = React.useState<number>(-1);
  const [loadedBlocks, setLoadedBlocks] = React.useState<Set<number>>(new Set());
  const [currentDatasource, setCurrentDatasource] = React.useState<
    IServerSideDatasource<TData> | IDatasource<TData> | null
  >(serverSideDatasource || datasource || null);

  // ============================================================================
  // SYNC EXTERNAL PROPS
  // ============================================================================
  React.useEffect(() => {
    setInternalColumnDefs(columnDefs);
  }, [columnDefs]);

  React.useEffect(() => {
    if (externalQuickFilterText !== undefined) {
      setQuickFilterText(externalQuickFilterText);
    }
  }, [externalQuickFilterText]);

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
      colId: getColId(colDef, index),
      sortable: colDef.sortable ?? globalSortable ?? defaultColDef?.sortable ?? false,
      filter: colDef.filter ?? defaultColDef?.filter ?? false,
      floatingFilter: colDef.floatingFilter ?? globalFloatingFilter ?? defaultColDef?.floatingFilter ?? false,
    }));
  }, [internalColumnDefs, defaultColDef, globalSortable, globalFloatingFilter]);

  const hasFloatingFilters = mergedColumnDefs.some((col) => col.floatingFilter && col.filter);
  const visibleColumns = mergedColumnDefs.filter((col) => !col.hide);

  // Compute unique values for set filters
  const columnFilterValues = React.useMemo(() => {
    const values: Record<string, (string | null)[]> = {};
    
    mergedColumnDefs.forEach((colDef) => {
      const filterType = typeof colDef.filter === "string" ? colDef.filter : "";
      if (filterType === "agSetColumnFilter" && colDef.field) {
        const uniqueValues = new Set<string | null>();
        (rowData ?? []).forEach((row) => {
          const value = getFieldValue(row, colDef.field!.toString());
          const strValue = value === null || value === undefined ? null : String(value);
          uniqueValues.add(strValue);
        });
        values[getColId(colDef)] = Array.from(uniqueValues).sort((a, b) => {
          if (a === null) return 1;
          if (b === null) return -1;
          return a.localeCompare(b);
        });
      }
    });
    
    return values;
  }, [rowData, mergedColumnDefs]);

  // ============================================================================
  // CLIENT-SIDE FILTERING
  // ============================================================================
  const filteredRowData = React.useMemo(() => {
    if (rowModelType !== "clientSide") {
      return rowData ?? [];
    }

    let data = rowData ?? [];

    // Apply quick filter
    if (quickFilterText) {
      const searchLower = quickFilterText.toLowerCase();
      data = data.filter((row) => {
        return mergedColumnDefs.some((colDef) => {
          if (colDef.hide) return false;
          const value = colDef.field ? getFieldValue(row, colDef.field.toString()) : null;
          return String(value ?? "").toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply column filters
    if (Object.keys(filterModel).length > 0) {
      data = data.filter((row) => {
        return Object.entries(filterModel).every(([colId, filterEntry]) => {
          const colDef = mergedColumnDefs.find((col) => getColId(col) === colId);
          if (!colDef || !colDef.field) return true;
          
          const value = getFieldValue(row, colDef.field.toString());
          return passesFilter(value, filterEntry);
        });
      });
    }

    return data;
  }, [rowData, rowModelType, quickFilterText, filterModel, mergedColumnDefs]);

  // ============================================================================
  // CLIENT-SIDE SORTING
  // ============================================================================
  const sortedRowData = React.useMemo(() => {
    if (rowModelType !== "clientSide" || sortModel.length === 0) {
      return filteredRowData;
    }

    const data = [...filteredRowData];
    
    data.sort((a, b) => {
      for (const sort of sortModel) {
        const colDef = mergedColumnDefs.find((col) => getColId(col) === sort.colId);
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
  }, [filteredRowData, sortModel, mergedColumnDefs, rowModelType]);

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

  // Reset to page 0 when filter changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [filterModel, quickFilterText]);

  // ============================================================================
  // FLOATING FILTER HANDLERS
  // ============================================================================
  const handleFloatingFilterChange = React.useCallback(
    (colId: string, value: string, filterType: string) => {
      setFloatingFilterValues((prev) => ({ ...prev, [colId]: value }));

      const debounceMs = 300;
      
      const timeoutId = setTimeout(() => {
        if (!value) {
          setFilterModel((prev) => {
            const next = { ...prev };
            delete next[colId];
            return next;
          });
        } else {
          const isNumber = filterType === "agNumberColumnFilter";
          
          if (isNumber) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              setFilterModel((prev) => ({
                ...prev,
                [colId]: {
                  filterType: "number",
                  type: "equals",
                  filter: numValue,
                } as NumberFilterModel,
              }));
            }
          } else {
            setFilterModel((prev) => ({
              ...prev,
              [colId]: {
                filterType: "text",
                type: "contains",
                filter: value,
              } as TextFilterModel,
            }));
          }
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    []
  );

  const clearFloatingFilter = React.useCallback((colId: string) => {
    setFloatingFilterValues((prev) => {
      const next = { ...prev };
      delete next[colId];
      return next;
    });
    setFilterModel((prev) => {
      const next = { ...prev };
      delete next[colId];
      return next;
    });
  }, []);

  // ============================================================================
  // SORTING HANDLERS
  // ============================================================================
  const handleSort = React.useCallback(
    (colId: string, isMultiSort: boolean) => {
      const currentSort = sortModel.find((s) => s.colId === colId);
      let newSortModel: SortModelItem[];

      if (isMultiSort) {
        if (!currentSort) {
          newSortModel = [...sortModel, { colId, sort: "asc" }];
        } else if (currentSort.sort === "asc") {
          newSortModel = sortModel.map((s) =>
            s.colId === colId ? { ...s, sort: "desc" as const } : s
          );
        } else {
          newSortModel = sortModel.filter((s) => s.colId !== colId);
        }
      } else {
        if (!currentSort) {
          newSortModel = [{ colId, sort: "asc" }];
        } else if (currentSort.sort === "asc") {
          newSortModel = [{ colId, sort: "desc" }];
        } else {
          newSortModel = [];
        }
      }

      setSortModel(newSortModel);
      
      if (rowModelType !== "clientSide") {
        setLoadedBlocks(new Set());
        setServerSideData([]);
      }
    },
    [sortModel, rowModelType]
  );

  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================
  const selectRow = React.useCallback(
    (nodeId: string, mode: "single" | "multiple") => {
      if (mode === "single") {
        setSelectedRowIds(new Set([nodeId]));
      } else {
        setSelectedRowIds((prev) => {
          const next = new Set(prev);
          if (next.has(nodeId)) {
            next.delete(nodeId);
          } else {
            next.add(nodeId);
          }
          return next;
        });
      }
    },
    []
  );

  const selectAll = React.useCallback(() => {
    setSelectedRowIds(new Set(rowNodes.map((node) => node.id)));
  }, [rowNodes]);

  const deselectAll = React.useCallback(() => {
    setSelectedRowIds(new Set());
  }, []);

  return {
    // State
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
    
    // Derived
    mergedColumnDefs,
    visibleColumns,
    hasFloatingFilters,
    columnFilterValues,
    filteredRowData,
    rowNodes,
    paginatedRowNodes,
    totalPages,
    
    // Column defs
    internalColumnDefs,
    setInternalColumnDefs,
    
    // Handlers
    handleFloatingFilterChange,
    clearFloatingFilter,
    handleSort,
    selectRow,
    selectAll,
    deselectAll,
    
    // Utils
    log,
  };
}

