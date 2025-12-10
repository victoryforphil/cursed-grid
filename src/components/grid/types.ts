/**
 * CursedGrid Types
 * AG Grid-compatible type definitions for the CursedGrid component library
 * Compatible with AG Grid Enterprise 32.3.1
 */

// ============================================================================
// SORTING TYPES
// ============================================================================

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc" | null;

/**
 * Sort model item - describes how a column is sorted
 */
export interface SortModelItem {
  /** Column ID */
  colId: string;
  /** Sort direction */
  sort: "asc" | "desc";
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filter model - key-value pairs of column ID to filter state
 */
export type FilterModel = Record<string, unknown>;

/**
 * Text filter model
 */
export interface TextFilterModel {
  filterType: "text";
  type: "contains" | "notContains" | "equals" | "notEqual" | "startsWith" | "endsWith" | "blank" | "notBlank";
  filter?: string;
}

/**
 * Number filter model
 */
export interface NumberFilterModel {
  filterType: "number";
  type: "equals" | "notEqual" | "greaterThan" | "greaterThanOrEqual" | "lessThan" | "lessThanOrEqual" | "inRange" | "blank" | "notBlank";
  filter?: number;
  filterTo?: number;
}

/**
 * Set filter model
 */
export interface SetFilterModel {
  filterType: "set";
  values: (string | null)[];
}

/**
 * Date filter model
 */
export interface DateFilterModel {
  filterType: "date";
  type: "equals" | "notEqual" | "lessThan" | "greaterThan" | "inRange" | "blank" | "notBlank";
  dateFrom?: string; // ISO date string (YYYY-MM-DD)
  dateTo?: string;   // For inRange filter
}

// ============================================================================
// SERVER-SIDE ROW MODEL TYPES (AG Grid Enterprise 32.3.1 Compatible)
// ============================================================================

/**
 * Column specification for row grouping
 */
export interface ColumnVO {
  id: string;
  displayName: string;
  field?: string;
  aggFunc?: string;
}

/**
 * Server-side get rows request - parameters sent to the server
 * Compatible with AG Grid's IServerSideGetRowsRequest
 */
export interface IServerSideGetRowsRequest {
  /** First row requested */
  startRow: number;
  /** Last row requested (exclusive) */
  endRow: number;
  /** Columns that are currently row grouped */
  rowGroupCols: ColumnVO[];
  /** Columns that have aggregations on them */
  valueCols: ColumnVO[];
  /** Columns that have pivot on them */
  pivotCols: ColumnVO[];
  /** Whether pivot mode is on or off */
  pivotMode: boolean;
  /** What groups the user is viewing */
  groupKeys: string[];
  /** Filter model */
  filterModel: FilterModel;
  /** Sort model */
  sortModel: SortModelItem[];
}

/**
 * Server-side get rows params - passed to datasource getRows
 * Compatible with AG Grid's IServerSideGetRowsParams
 */
export interface IServerSideGetRowsParams<TData = unknown> {
  /** Request details */
  request: IServerSideGetRowsRequest;
  /** Parent row node (for grouped data) */
  parentNode: RowNode<TData> | null;
  /** Callback to call when rows retrieved successfully */
  success: (params: LoadSuccessParams<TData>) => void;
  /** Callback to call when loading fails */
  fail: () => void;
  /** The grid api */
  api: GridApi<TData>;
  /** The column api */
  columnApi: ColumnApi<TData>;
}

/**
 * Success callback params
 */
export interface LoadSuccessParams<TData = unknown> {
  /** Row data loaded */
  rowData: TData[];
  /** Total row count (-1 if unknown) */
  rowCount?: number;
  /** Group info for tree/grouped data */
  groupLevelInfo?: unknown;
}

/**
 * Server-side datasource interface
 * Compatible with AG Grid's IServerSideDatasource
 */
export interface IServerSideDatasource<TData = unknown> {
  /** Called when the grid needs rows */
  getRows: (params: IServerSideGetRowsParams<TData>) => void;
  /** Optional destroy method */
  destroy?: () => void;
}

/**
 * Infinite scroll datasource interface (simpler than server-side)
 * Compatible with AG Grid's IDatasource
 */
export interface IDatasource<TData = unknown> {
  /** Called when the grid needs rows */
  getRows: (params: IGetRowsParams<TData>) => void;
  /** Optional destroy method */
  destroy?: () => void;
  /** Optional row count (if known) */
  rowCount?: number;
}

/**
 * Infinite scroll get rows params
 */
export interface IGetRowsParams<TData = unknown> {
  /** First row requested */
  startRow: number;
  /** Last row requested */
  endRow: number;
  /** Sort model */
  sortModel: SortModelItem[];
  /** Filter model */
  filterModel: FilterModel;
  /** Callback for success */
  successCallback: (rowsThisBlock: TData[], lastRow?: number) => void;
  /** Callback for failure */
  failCallback: () => void;
  /** Context object (if any) */
  context?: unknown;
}

// ============================================================================
// ROW MODEL TYPES
// ============================================================================

/**
 * Row model type
 */
export type RowModelType = "clientSide" | "serverSide" | "infinite";

// ============================================================================
// SIDEBAR TYPES
// ============================================================================

/**
 * Tool panel definition
 */
export interface ToolPanelDef {
  id: string;
  labelDefault?: string;
  labelKey?: string;
  iconKey?: string;
  toolPanel?: string | React.ComponentType;
  toolPanelParams?: {
    suppressRowGroups?: boolean;
    suppressValues?: boolean;
    suppressPivots?: boolean;
    suppressPivotMode?: boolean;
    suppressColumnFilter?: boolean;
    suppressColumnSelectAll?: boolean;
    suppressColumnExpandAll?: boolean;
    suppressExpandAll?: boolean;
    suppressFilterSearch?: boolean;
  };
}

/**
 * Sidebar configuration
 */
export interface SideBarDef {
  toolPanels?: (string | ToolPanelDef)[];
  defaultToolPanel?: string;
  hiddenByDefault?: boolean;
  position?: "left" | "right";
}

// ============================================================================
// CONTEXT MENU TYPES
// ============================================================================

/**
 * Context menu item
 */
export interface ContextMenuItem {
  name: string;
  action?: () => void;
  shortcut?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  subMenu?: (string | ContextMenuItem)[];
  cssClasses?: string[];
}

/**
 * Params for getContextMenuItems
 */
export interface GetContextMenuItemsParams<TData = unknown> {
  node: RowNode<TData> | null;
  column: ColDef<TData> | null;
  value: unknown;
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
}

// ============================================================================
// COLUMN DEFINITION
// ============================================================================

/**
 * Filter type - specifies which filter component to use
 */
export type FilterType = "agTextColumnFilter" | "agNumberColumnFilter" | "agDateColumnFilter" | "agSetColumnFilter" | true | false;

/**
 * Filter params - configuration for column filters
 */
export interface FilterParams {
  /** Filter buttons to show */
  buttons?: ("apply" | "clear" | "reset" | "cancel")[];
  /** Close filter popup on apply */
  closeOnApply?: boolean;
  /** Maximum number of filter conditions */
  maxNumConditions?: number;
  /** Available filter options */
  filterOptions?: string[];
  /** Predefined values for set filter */
  values?: (string | null)[];
  /** Default to nothing selected (set filter) */
  defaultToNothingSelected?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce time in ms */
  debounceMs?: number;
  /** Case sensitive filtering */
  caseSensitive?: boolean;
  /** Custom key creator for set filter */
  keyCreator?: (params: { value: unknown }) => string;
  /** Custom value formatter for set filter display */
  valueFormatter?: (params: { value: unknown }) => string;
}

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
  /** Whether the column is filterable - true, false, or filter type string */
  filter?: FilterType;
  /** Whether to show floating filter for this column */
  floatingFilter?: boolean;
  /** Filter params for customizing filter behavior */
  filterParams?: FilterParams;
  /** Custom filter value getter */
  filterValueGetter?: (params: ValueGetterParams<TData>) => unknown;
  /** Custom quick filter text getter */
  getQuickFilterText?: (params: { value: unknown; data: TData }) => string;
  /** Whether the column is resizable */
  resizable?: boolean;
  /** Whether the column is hidden */
  hide?: boolean;
  /** Pin the column to left or right */
  pinned?: "left" | "right" | null;
  /** Suppress the column menu */
  suppressMenu?: boolean;
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
  
  // Selection
  /** Show checkbox for selection in this column */
  checkboxSelection?: boolean | ((params: { data: TData; node: RowNode<TData> }) => boolean);
  /** Show checkbox in header for select all */
  headerCheckboxSelection?: boolean;
  /** Only select filtered rows when using header checkbox */
  headerCheckboxSelectionFilteredOnly?: boolean;
  
  // Tooltips
  /** Field to use for tooltip */
  tooltipField?: string;
  /** Custom tooltip value getter */
  tooltipValueGetter?: (params: { value: unknown; data: TData; node: RowNode<TData> }) => string;
  /** Custom tooltip component */
  tooltipComponent?: React.ComponentType<{ value: string }>;
  
  // Cell Styling
  /** Inline styles for cells */
  cellStyle?: React.CSSProperties | ((params: CellClassParams<TData>) => React.CSSProperties);
  /** Auto-adjust row height based on cell content */
  autoHeight?: boolean;
  
  // Row Grouping
  /** Enable row grouping on this column */
  rowGroup?: boolean;
  /** Row group index (priority) */
  rowGroupIndex?: number;
  /** Aggregation function for grouped data */
  aggFunc?: "sum" | "min" | "max" | "count" | "avg" | "first" | "last" | ((params: { values: unknown[] }) => unknown);
  /** Custom key creator for grouping */
  keyCreator?: (params: { value: unknown }) => string;
  
  // Behavior
  /** Prevent column from being moved */
  suppressMovable?: boolean;
  /** Suppress cell focus for this column */
  suppressCellFocus?: boolean;
  /** Suppress size to fit for this column */
  suppressSizeToFit?: boolean;
  /** Suppress keyboard events */
  suppressKeyboardEvent?: (params: { event: KeyboardEvent }) => boolean;
  /** Enable cell change flash */
  enableCellChangeFlash?: boolean;
  
  // Default sort
  /** Default sort direction */
  sort?: "asc" | "desc" | null;
  /** Sort index for multi-column sorting */
  sortIndex?: number;
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
 * Compatible with AG Grid's GridApi
 */
export interface GridApi<TData = unknown> {
  /** Get all row data (client-side only) */
  getRowData: () => TData[];
  /** Set row data (client-side only) */
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
  /** Size columns to fit available width */
  sizeColumnsToFit: (containerWidth?: number) => void;
  /** Auto-size a column based on content */
  autoSizeColumn: (colId: string, skipHeader?: boolean) => void;
  /** Auto-size all columns based on content */
  autoSizeAllColumns: (skipHeader?: boolean) => void;
  /** Set column width */
  setColumnWidth: (colId: string, width: number) => void;
  /** Set column visible */
  setColumnVisible: (colId: string, visible: boolean) => void;
  /** Set column pinned */
  setColumnPinned: (colId: string, pinned: "left" | "right" | null) => void;
  /** Move column to a new position */
  moveColumn: (colId: string, toIndex: number) => void;
  
  // Sorting & Filtering
  /** Get the current sort model */
  getSortModel: () => SortModelItem[];
  /** Set the sort model */
  setSortModel: (sortModel: SortModelItem[]) => void;
  /** Get the current filter model */
  getFilterModel: () => FilterModel;
  /** Set the filter model (pass null to clear) */
  setFilterModel: (filterModel: FilterModel | null) => void;
  
  // Server-side row model
  /** Set the server-side datasource */
  setServerSideDatasource: (datasource: IServerSideDatasource<TData>) => void;
  /** Refresh the server-side store */
  refreshServerSide: (params?: { route?: string[]; purge?: boolean }) => void;
  /** Get displayed row count */
  getDisplayedRowCount: () => number;
  /** Get a row node by ID */
  getRowNode: (id: string) => RowNode<TData> | undefined;
  
  // Infinite scroll
  /** Set the infinite scroll datasource */
  setDatasource: (datasource: IDatasource<TData>) => void;
  /** Purge the infinite scroll cache */
  purgeInfiniteCache: () => void;
  /** Refresh infinite cache */
  refreshInfiniteCache: () => void;
  
  // Generic grid option setter (AG Grid 32+ style)
  /** Set a single grid option dynamically */
  setGridOption: <K extends keyof GridOptions<TData>>(key: K, value: GridOptions<TData>[K]) => void;
  
  // Display operations
  /** Ensure row index is visible */
  ensureIndexVisible: (index: number, position?: "top" | "bottom" | "middle") => void;
  /** Ensure column is visible */
  ensureColumnVisible: (colId: string, position?: "start" | "middle" | "end") => void;
  /** Get all displayed columns */
  getAllDisplayedColumns: () => ColDef<TData>[];
  
  // Row grouping
  /** Expand all row groups */
  expandAll: () => void;
  /** Collapse all row groups */
  collapseAll: () => void;
  /** Set row node expanded state */
  setRowNodeExpanded: (node: RowNode<TData>, expanded: boolean, recursive?: boolean) => void;
  /** Iterate over all nodes */
  forEachNode: (callback: (node: RowNode<TData>, index: number) => void) => void;
  
  // Selection
  /** Get selected nodes */
  getSelectedNodes: () => RowNode<TData>[];
  
  // State persistence
  /** Get current grid state */
  getState: () => GridState;
  /** Get column group state */
  getColumnGroupState: () => { groupId: string; open: boolean }[];
  /** Set column group state */
  setColumnGroupState: (state: { groupId: string; open: boolean }[]) => void;
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
 * Sort changed event
 */
export interface SortChangedEvent<TData = unknown> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  source: "api" | "uiColumnSorted";
}

/**
 * Filter changed event
 */
export interface FilterChangedEvent<TData = unknown> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
}

/**
 * Model updated event (fired when data changes)
 */
export interface ModelUpdatedEvent<TData = unknown> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  /** True if this is the first time data is rendered */
  newData: boolean;
  /** True if pagination has changed */
  newPage: boolean;
  /** True if animation has finished */
  animate: boolean;
  /** True if data is finished loading */
  keepRenderedRows: boolean;
}

/**
 * Column event (for visibility, pinning, resizing, moving)
 */
export interface ColumnEvent<TData = unknown> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  column: ColDef<TData> | null;
  columns: ColDef<TData>[];
  source: string;
}

/**
 * Row group opened event
 */
export interface RowGroupOpenedEvent<TData = unknown> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  node: RowNode<TData>;
  expanded: boolean;
}

/**
 * Grid state for persistence
 */
export interface GridState {
  filter?: FilterModel;
  sort?: SortModelItem[];
  columnState?: ColumnState[];
  columnGroupState?: { groupId: string; open: boolean }[];
}

/**
 * Main Grid Options - configuration for the CursedGrid
 * Compatible with AG Grid's GridOptions interface (Enterprise 32.3.1)
 */
export interface GridOptions<TData = unknown> {
  // ============================================================================
  // DATA
  // ============================================================================
  /** Row data to display (client-side row model only) */
  rowData?: TData[] | null;
  /** Column definitions */
  columnDefs?: ColDef<TData>[];
  /** Default column definition (applied to all columns) */
  defaultColDef?: Partial<ColDef<TData>>;
  
  // ============================================================================
  // ROW MODEL
  // ============================================================================
  /** Type of row model: 'clientSide', 'serverSide', or 'infinite' */
  rowModelType?: RowModelType;
  
  // ============================================================================
  // SERVER-SIDE ROW MODEL (Enterprise)
  // ============================================================================
  /** Datasource for server-side row model */
  serverSideDatasource?: IServerSideDatasource<TData>;
  /** Number of rows per block in the server-side cache. Default: 100 */
  cacheBlockSize?: number;
  /** Maximum number of blocks in cache. Default: unlimited for full store */
  maxBlocksInCache?: number;
  /** Initial row count while loading first data. Default: 0 */
  serverSideInitialRowCount?: number;
  /** Purge closed row nodes from cache. Default: false */
  purgeClosedRowNodes?: boolean;
  /** Suppress infinite scroll for server-side (use full store). Default: false */
  suppressServerSideInfiniteScroll?: boolean;
  /** Apply sorting on all levels (not just leaf). Default: false */
  serverSideSortAllLevels?: boolean;
  /** Only refresh filtered groups. Default: false */
  serverSideOnlyRefreshFilteredGroups?: boolean;
  /** Debounce time before loading blocks (ms). Default: 0 */
  blockLoadDebounceMillis?: number;
  
  // ============================================================================
  // INFINITE SCROLL ROW MODEL
  // ============================================================================
  /** Datasource for infinite scroll row model */
  datasource?: IDatasource<TData>;
  /** Size of the cache for infinite scroll. Default: 100 */
  cacheOverflowSize?: number;
  /** Max concurrent datasource requests. Default: 2 */
  maxConcurrentDatasourceRequests?: number;
  /** Infinite scroll initial row count */
  infiniteInitialRowCount?: number;
  
  // ============================================================================
  // SORTING
  // ============================================================================
  /** Enable sorting on all columns. Overridden by column sortable. */
  sortable?: boolean;
  /** Multi-sort key: 'ctrl' or 'shift'. Default: 'ctrl' */
  multiSortKey?: "ctrl" | "shift";
  /** Allow unsort (back to no sort). Default: true */
  unSortIcon?: boolean;
  /** Always show the sort icon, not just when sorted. Default: false */
  alwaysShowVerticalScroll?: boolean;
  
  // ============================================================================
  // FILTERING
  // ============================================================================
  /** Enable filtering on all columns. Overridden by column filter. */
  filter?: boolean;
  /** Float filters at top. Default: false */
  floatingFilter?: boolean;
  /** Quick filter text */
  quickFilterText?: string;
  
  // ============================================================================
  // LAYOUT
  // ============================================================================
  /** Row height in pixels */
  rowHeight?: number;
  /** Header height in pixels */
  headerHeight?: number;
  /** DOM layout */
  domLayout?: "normal" | "autoHeight" | "print";
  /** Suppress horizontal scroll */
  suppressHorizontalScroll?: boolean;
  /** Suppress column virtualization */
  suppressColumnVirtualisation?: boolean;
  /** Suppress row virtualization */
  suppressRowVirtualisation?: boolean;
  
  // ============================================================================
  // SELECTION
  // ============================================================================
  /** Enable row selection */
  rowSelection?: "single" | "multiple" | null;
  /** Suppress row click selection */
  suppressRowClickSelection?: boolean;
  /** Enable cell selection */
  cellSelection?: boolean;
  /** Enable text selection in cells */
  enableCellTextSelection?: boolean;
  /** Enable range selection */
  enableRangeSelection?: boolean;
  /** Group selects children */
  groupSelectsChildren?: boolean;
  
  // ============================================================================
  // PAGINATION
  // ============================================================================
  /** Enable pagination */
  pagination?: boolean;
  /** Page size */
  paginationPageSize?: number;
  /** Pagination panel page size options */
  paginationPageSizeSelector?: number[] | boolean;
  
  // ============================================================================
  // APPEARANCE
  // ============================================================================
  /** Enable animation */
  animateRows?: boolean;
  /** Row class */
  rowClass?: string | ((params: { data: TData; rowIndex: number }) => string);
  /** Theme */
  theme?: "cursed" | "alpine" | "balham" | "material";
  
  // ============================================================================
  // TOOLBAR / SIDE BAR
  // ============================================================================
  /** Show the columns panel button in toolbar. Default: false */
  showColumnsPanel?: boolean;
  /** Show built-in toolbar. Default: false (toolbar is externally controlled) */
  showToolbar?: boolean;
  /** Sidebar configuration */
  sideBar?: boolean | SideBarDef | string;
  
  // ============================================================================
  // ROW GROUPING
  // ============================================================================
  /** How to display grouped rows */
  groupDisplayType?: "singleColumn" | "multipleColumns" | "groupRows" | "custom";
  /** Default expanded level (0 = all collapsed, -1 = all expanded) */
  groupDefaultExpanded?: number;
  /** Callback to determine if group should be open by default */
  isGroupOpenByDefault?: (params: { rowNode: RowNode<TData>; level: number }) => boolean;
  /** Auto group column definition */
  autoGroupColumnDef?: ColDef<TData>;
  /** Suppress aggregation function in header */
  suppressAggFuncInHeader?: boolean;
  /** Group row renderer params */
  groupRowRendererParams?: Record<string, unknown>;
  
  // ============================================================================
  // CONTEXT MENU
  // ============================================================================
  /** Custom context menu items */
  getContextMenuItems?: (params: GetContextMenuItemsParams<TData>) => (string | ContextMenuItem)[];
  /** Allow context menu with control key */
  allowContextMenuWithControlKey?: boolean;
  
  // ============================================================================
  // CLIPBOARD
  // ============================================================================
  /** Copy headers to clipboard */
  copyHeadersToClipboard?: boolean;
  /** Process header for clipboard */
  processHeaderForClipboard?: (params: { column: ColDef<TData> }) => string;
  /** Process cell for clipboard */
  processCellForClipboard?: (params: { value: unknown; node: RowNode<TData>; column: ColDef<TData> }) => string;
  
  // ============================================================================
  // IDENTIFICATION
  // ============================================================================
  /** Get row ID function */
  getRowId?: (params: { data: TData }) => string;
  
  // ============================================================================
  // OVERLAYS
  // ============================================================================
  /** Loading overlay template */
  overlayLoadingTemplate?: string;
  /** No rows overlay template */
  overlayNoRowsTemplate?: string;
  
  // ============================================================================
  // CALLBACKS / EVENTS
  // ============================================================================
  /** Callback when grid is ready */
  onGridReady?: (event: GridReadyEvent<TData>) => void;
  /** Callback when selection changes */
  onSelectionChanged?: (event: SelectionChangedEvent<TData>) => void;
  /** Callback when cell is clicked */
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
  /** Callback when row is clicked */
  onRowClicked?: (event: RowClickedEvent<TData>) => void;
  /** Callback when sort changes */
  onSortChanged?: (event: SortChangedEvent<TData>) => void;
  /** Callback when filter changes */
  onFilterChanged?: (event: FilterChangedEvent<TData>) => void;
  /** Callback when model is updated */
  onModelUpdated?: (event: ModelUpdatedEvent<TData>) => void;
  /** Callback when first data is rendered */
  onFirstDataRendered?: (event: GridReadyEvent<TData>) => void;
  /** Callback when state is updated */
  onStateUpdated?: (event: { state: GridState }) => void;
  /** Callback when column is made visible/hidden */
  onColumnVisible?: (event: ColumnEvent<TData>) => void;
  /** Callback when column is pinned/unpinned */
  onColumnPinned?: (event: ColumnEvent<TData>) => void;
  /** Callback when column is resized */
  onColumnResized?: (event: ColumnEvent<TData>) => void;
  /** Callback when column is moved */
  onColumnMoved?: (event: ColumnEvent<TData>) => void;
  /** Callback when row double clicked */
  onRowDoubleClicked?: (event: RowClickedEvent<TData>) => void;
  /** Callback when row group is opened/closed */
  onRowGroupOpened?: (event: RowGroupOpenedEvent<TData>) => void;
  /** Callback when body scroll ends */
  onBodyScrollEnd?: (event: { api: GridApi<TData> }) => void;
}

/**
 * CursedGrid Props - props for the CursedGrid component
 */
export interface CursedGridProps<TData = unknown> extends GridOptions<TData> {
  /** Additional CSS class name */
  className?: string;
  /** CSS style */
  style?: React.CSSProperties;
  /** Loading state (externally controlled) */
  loading?: boolean;
  /** Debug mode - logs events and state changes */
  debug?: boolean;
}
