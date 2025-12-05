/**
 * CursedGrid Types
 * AG Grid-compatible type definitions for the CursedGrid component library
 */

/**
 * Column definition - describes a column in the grid
 * Similar to AG Grid's ColDef interface
 */
export interface ColDef<TData = unknown> {
  /** Unique identifier for the column */
  colId?: string;
  /** The field of the row data to display */
  field?: keyof TData | string;
  /** Display name for the column header */
  headerName?: string;
  /** Width of the column in pixels */
  width?: number;
  /** Minimum width of the column */
  minWidth?: number;
  /** Maximum width of the column */
  maxWidth?: number;
  /** Flex grow for responsive sizing */
  flex?: number;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether the column is filterable */
  filter?: boolean | string;
  /** Whether the column is resizable */
  resizable?: boolean;
  /** Whether the column is hidden */
  hide?: boolean;
  /** Pin the column to left or right */
  pinned?: "left" | "right" | null;
  /** Custom cell renderer component */
  cellRenderer?: React.ComponentType<CellRendererParams<TData>>;
  /** Custom cell renderer function */
  cellRendererFramework?: React.ComponentType<CellRendererParams<TData>>;
  /** Value getter function */
  valueGetter?: (params: ValueGetterParams<TData>) => unknown;
  /** Value formatter function */
  valueFormatter?: (params: ValueFormatterParams<TData>) => string;
  /** CSS class for the cell */
  cellClass?: string | ((params: CellClassParams<TData>) => string);
  /** CSS class for the header */
  headerClass?: string;
  /** Whether column is editable */
  editable?: boolean;
  /** Custom comparator for sorting */
  comparator?: (valueA: unknown, valueB: unknown, nodeA: RowNode<TData>, nodeB: RowNode<TData>) => number;
  /** Children columns for column groups */
  children?: ColDef<TData>[];
  /** Header group name */
  headerGroupComponent?: React.ComponentType;
}

/**
 * Row node representation
 */
export interface RowNode<TData = unknown> {
  /** Unique row ID */
  id: string;
  /** Row data */
  data: TData;
  /** Row index */
  rowIndex: number;
  /** Is row selected */
  isSelected: boolean;
  /** Is row expanded */
  isExpanded?: boolean;
  /** Parent row node (for tree data) */
  parent?: RowNode<TData>;
  /** Child row nodes (for tree data) */
  children?: RowNode<TData>[];
}

/**
 * Cell renderer parameters
 */
export interface CellRendererParams<TData = unknown> {
  /** Cell value */
  value: unknown;
  /** Full row data */
  data: TData;
  /** Column definition */
  colDef: ColDef<TData>;
  /** Row node */
  node: RowNode<TData>;
  /** Row index */
  rowIndex: number;
  /** Column ID */
  colId: string;
}

/**
 * Value getter parameters
 */
export interface ValueGetterParams<TData = unknown> {
  /** Full row data */
  data: TData;
  /** Column definition */
  colDef: ColDef<TData>;
  /** Row node */
  node: RowNode<TData>;
  /** Column ID */
  colId: string;
}

/**
 * Value formatter parameters
 */
export interface ValueFormatterParams<TData = unknown> {
  /** Cell value */
  value: unknown;
  /** Full row data */
  data: TData;
  /** Column definition */
  colDef: ColDef<TData>;
  /** Row node */
  node: RowNode<TData>;
  /** Column ID */
  colId: string;
}

/**
 * Cell class parameters
 */
export interface CellClassParams<TData = unknown> {
  /** Cell value */
  value: unknown;
  /** Full row data */
  data: TData;
  /** Column definition */
  colDef: ColDef<TData>;
  /** Row node */
  node: RowNode<TData>;
  /** Row index */
  rowIndex: number;
  /** Column ID */
  colId: string;
}

/**
 * Grid API for programmatic control
 */
export interface GridApi<TData = unknown> {
  /** Get all row data */
  getRowData: () => TData[];
  /** Set row data */
  setRowData: (data: TData[]) => void;
  /** Get selected rows */
  getSelectedRows: () => TData[];
  /** Select all rows */
  selectAll: () => void;
  /** Deselect all rows */
  deselectAll: () => void;
  /** Refresh cells */
  refreshCells: () => void;
  /** Export to CSV */
  exportDataAsCsv: () => void;
  /** Get column definitions */
  getColumnDefs: () => ColDef<TData>[];
  /** Set column definitions */
  setColumnDefs: (colDefs: ColDef<TData>[]) => void;
  /** Size columns to fit */
  sizeColumnsToFit: () => void;
  /** Auto-size all columns */
  autoSizeAllColumns: () => void;
}

/**
 * Column API for column operations
 */
export interface ColumnApi<TData = unknown> {
  /** Get all columns */
  getColumns: () => ColDef<TData>[];
  /** Set column visible */
  setColumnVisible: (colId: string, visible: boolean) => void;
  /** Get column state */
  getColumnState: () => ColumnState[];
  /** Apply column state */
  applyColumnState: (state: ColumnState[]) => void;
  /** Move column */
  moveColumn: (colId: string, toIndex: number) => void;
  /** Set column pinned */
  setColumnPinned: (colId: string, pinned: "left" | "right" | null) => void;
}

/**
 * Column state for saving/restoring column configuration
 */
export interface ColumnState {
  colId: string;
  width?: number;
  hide?: boolean;
  pinned?: "left" | "right" | null;
  sort?: "asc" | "desc" | null;
  sortIndex?: number;
}

/**
 * Sort model
 */
export interface SortModelItem {
  colId: string;
  sort: "asc" | "desc";
}

/**
 * Filter model
 */
export type FilterModel = Record<string, unknown>;

/**
 * Selection changed event
 */
export interface SelectionChangedEvent<TData = unknown> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  selectedRows: TData[];
}

/**
 * Cell clicked event
 */
export interface CellClickedEvent<TData = unknown> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  data: TData;
  value: unknown;
  colDef: ColDef<TData>;
  rowIndex: number;
  node: RowNode<TData>;
}

/**
 * Row clicked event
 */
export interface RowClickedEvent<TData = unknown> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  data: TData;
  rowIndex: number;
  node: RowNode<TData>;
}

/**
 * Grid ready event
 */
export interface GridReadyEvent<TData = unknown> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
}

/**
 * Main Grid Options - configuration for the CursedGrid
 * Similar to AG Grid's GridOptions interface
 */
export interface GridOptions<TData = unknown> {
  /** Row data to display */
  rowData?: TData[] | null;
  /** Column definitions */
  columnDefs?: ColDef<TData>[];
  /** Default column definition (applied to all columns) */
  defaultColDef?: Partial<ColDef<TData>>;
  /** Row height in pixels */
  rowHeight?: number;
  /** Header height in pixels */
  headerHeight?: number;
  /** Enable row selection */
  rowSelection?: "single" | "multiple" | null;
  /** Suppress row click selection */
  suppressRowClickSelection?: boolean;
  /** Enable pagination */
  pagination?: boolean;
  /** Page size */
  paginationPageSize?: number;
  /** Enable animation */
  animateRows?: boolean;
  /** Row class */
  rowClass?: string | ((params: { data: TData; rowIndex: number }) => string);
  /** Get row ID function */
  getRowId?: (params: { data: TData }) => string;
  /** Callback when grid is ready */
  onGridReady?: (event: GridReadyEvent<TData>) => void;
  /** Callback when selection changes */
  onSelectionChanged?: (event: SelectionChangedEvent<TData>) => void;
  /** Callback when cell is clicked */
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
  /** Callback when row is clicked */
  onRowClicked?: (event: RowClickedEvent<TData>) => void;
  /** Enable overlay loading */
  overlayLoadingTemplate?: string;
  /** Enable overlay no rows */
  overlayNoRowsTemplate?: string;
  /** DOM layout */
  domLayout?: "normal" | "autoHeight" | "print";
  /** Suppress horizontal scroll */
  suppressHorizontalScroll?: boolean;
  /** Suppress column virtualization */
  suppressColumnVirtualisation?: boolean;
  /** Suppress row virtualization */
  suppressRowVirtualisation?: boolean;
  /** Theme */
  theme?: "cursed" | "alpine" | "balham" | "material";
}

/**
 * CursedGrid Props - props for the CursedGrid component
 */
export interface CursedGridProps<TData = unknown> extends GridOptions<TData> {
  /** Additional CSS class name */
  className?: string;
  /** CSS style */
  style?: React.CSSProperties;
  /** Loading state */
  loading?: boolean;
}
