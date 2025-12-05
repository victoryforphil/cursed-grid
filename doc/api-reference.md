# API Reference

## CursedGrid Component

The main grid component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rowData` | `TData[]` | `[]` | Array of data objects to display |
| `columnDefs` | `ColDef<TData>[]` | `[]` | Column definitions |
| `defaultColDef` | `Partial<ColDef<TData>>` | `undefined` | Default column settings applied to all columns |
| `rowHeight` | `number` | `40` | Height of each row in pixels |
| `headerHeight` | `number` | `40` | Height of the header row in pixels |
| `rowSelection` | `"single" \| "multiple" \| null` | `null` | Row selection mode |
| `suppressRowClickSelection` | `boolean` | `false` | Prevent row selection on click |
| `pagination` | `boolean` | `false` | Enable pagination |
| `paginationPageSize` | `number` | `10` | Number of rows per page |
| `animateRows` | `boolean` | `false` | Enable row animations |
| `rowClass` | `string \| Function` | `undefined` | CSS class for rows |
| `getRowId` | `Function` | `undefined` | Function to generate row IDs |
| `loading` | `boolean` | `false` | Show loading overlay |
| `overlayLoadingTemplate` | `string` | `"Loading..."` | Loading overlay text |
| `overlayNoRowsTemplate` | `string` | `"No rows to display"` | No rows overlay text |
| `domLayout` | `"normal" \| "autoHeight" \| "print"` | `"normal"` | Grid layout mode |
| `theme` | `"cursed" \| "alpine" \| "balham" \| "material"` | `"cursed"` | Grid theme |
| `className` | `string` | `undefined` | Additional CSS class |
| `style` | `CSSProperties` | `undefined` | Inline styles |

### Callbacks

| Callback | Type | Description |
|----------|------|-------------|
| `onGridReady` | `(event: GridReadyEvent) => void` | Called when grid is initialized |
| `onSelectionChanged` | `(event: SelectionChangedEvent) => void` | Called when row selection changes |
| `onCellClicked` | `(event: CellClickedEvent) => void` | Called when a cell is clicked |
| `onRowClicked` | `(event: RowClickedEvent) => void` | Called when a row is clicked |

---

## GridApi

Methods for programmatic grid control, available via `onGridReady` callback.

### Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getRowData()` | `TData[]` | Get all row data |
| `setRowData(data: TData[])` | `void` | Set row data |
| `getSelectedRows()` | `TData[]` | Get selected row data |
| `selectAll()` | `void` | Select all rows |
| `deselectAll()` | `void` | Deselect all rows |
| `refreshCells()` | `void` | Refresh all cells |
| `exportDataAsCsv()` | `void` | Export data to CSV file |
| `getColumnDefs()` | `ColDef<TData>[]` | Get column definitions |
| `setColumnDefs(colDefs)` | `void` | Set column definitions |
| `sizeColumnsToFit()` | `void` | Size columns to fit grid width |
| `autoSizeAllColumns()` | `void` | Auto-size all columns |

---

## ColumnApi

Methods for column operations.

### Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getColumns()` | `ColDef<TData>[]` | Get all columns |
| `setColumnVisible(colId, visible)` | `void` | Show/hide a column |
| `getColumnState()` | `ColumnState[]` | Get column state |
| `applyColumnState(state)` | `void` | Apply column state |
| `moveColumn(colId, toIndex)` | `void` | Move a column |
| `setColumnPinned(colId, pinned)` | `void` | Pin/unpin a column |

---

## ColDef

Column definition interface.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `colId` | `string` | Unique column identifier |
| `field` | `string` | Data field name |
| `headerName` | `string` | Column header text |
| `width` | `number` | Column width in pixels |
| `minWidth` | `number` | Minimum column width |
| `maxWidth` | `number` | Maximum column width |
| `flex` | `number` | Flex grow value |
| `sortable` | `boolean` | Enable sorting |
| `filter` | `boolean \| string` | Enable filtering |
| `resizable` | `boolean` | Enable resizing |
| `hide` | `boolean` | Hide column |
| `pinned` | `"left" \| "right" \| null` | Pin column position |
| `editable` | `boolean` | Enable editing |
| `cellClass` | `string \| Function` | CSS class for cells |
| `headerClass` | `string` | CSS class for header |
| `cellRenderer` | `Component` | Custom cell renderer component |
| `valueGetter` | `Function` | Custom value getter |
| `valueFormatter` | `Function` | Value display formatter |
| `comparator` | `Function` | Custom sort comparator |
| `children` | `ColDef[]` | Child columns (for groups) |

---

## Event Objects

### GridReadyEvent

```typescript
interface GridReadyEvent<TData> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
}
```

### SelectionChangedEvent

```typescript
interface SelectionChangedEvent<TData> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  selectedRows: TData[];
}
```

### CellClickedEvent

```typescript
interface CellClickedEvent<TData> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  data: TData;
  value: unknown;
  colDef: ColDef<TData>;
  rowIndex: number;
  node: RowNode<TData>;
}
```

### RowClickedEvent

```typescript
interface RowClickedEvent<TData> {
  api: GridApi<TData>;
  columnApi: ColumnApi<TData>;
  data: TData;
  rowIndex: number;
  node: RowNode<TData>;
}
```

---

## RowNode

Row node interface.

```typescript
interface RowNode<TData> {
  id: string;
  data: TData;
  rowIndex: number;
  isSelected: boolean;
  isExpanded?: boolean;
  parent?: RowNode<TData>;
  children?: RowNode<TData>[];
}
```

---

## CellRendererParams

Parameters passed to custom cell renderers.

```typescript
interface CellRendererParams<TData> {
  value: unknown;
  data: TData;
  colDef: ColDef<TData>;
  node: RowNode<TData>;
  rowIndex: number;
  colId: string;
}
```

---

## ValueFormatterParams

Parameters passed to value formatters.

```typescript
interface ValueFormatterParams<TData> {
  value: unknown;
  data: TData;
  colDef: ColDef<TData>;
  node: RowNode<TData>;
  colId: string;
}
```

---

## ValueGetterParams

Parameters passed to value getters.

```typescript
interface ValueGetterParams<TData> {
  data: TData;
  colDef: ColDef<TData>;
  node: RowNode<TData>;
  colId: string;
}
```
