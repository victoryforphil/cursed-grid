# CursedGrid Documentation

## Overview

CursedGrid is a high-performance, AG Grid-compatible data grid component library for React applications. It's built with modern technologies and follows best practices for component development.

## Table of Contents

1. [Getting Started](./getting-started.md)
2. [API Reference](./api-reference.md)
3. [Column Definitions](./column-definitions.md)
4. [Examples](./examples.md)

## Quick Start

```tsx
import { CursedGrid } from "@/components/grid";

const columnDefs = [
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email" },
];

const rowData = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" },
];

function App() {
  return <CursedGrid columnDefs={columnDefs} rowData={rowData} />;
}
```

## Features

### Core Features
- ✅ AG Grid-compatible API (Enterprise 32.3.1)
- ✅ TypeScript support with full type safety
- ✅ React 19 native support
- ✅ Dark mode support
- ✅ Storybook documentation
- ✅ Modular component architecture

### Row Models (Enterprise)
- ✅ **Client-Side Row Model** - In-memory data with sorting/filtering
- ✅ **Server-Side Row Model** - Lazy loading with `IServerSideDatasource`
- ✅ **Infinite Scroll Row Model** - Simple infinite scroll with `IDatasource`

### Sorting
- ✅ **Client-side sorting** - Instant in-memory sorting
- ✅ **Server-side sorting** - Sort model passed to datasource
- ✅ **Multi-column sorting** - Ctrl/Cmd+click for multiple columns
- ✅ **Custom comparators** - Define custom sort logic
- ✅ Sort indicators with multi-sort index

### Filtering
- ✅ **Text Column Filter** (agTextColumnFilter) - Contains, equals, starts with, etc.
- ✅ **Number Column Filter** (agNumberColumnFilter) - Numeric comparisons, ranges
- ✅ **Set Column Filter** (agSetColumnFilter) - Multi-select checkbox filtering
- ✅ **Date Column Filter** (agDateColumnFilter) - Date range filtering
- ✅ **Floating Filters** - Inline filter inputs below headers
- ✅ **Quick Filter** - Global search across all columns
- ✅ **Column Menu** - Dropdown menu with filter options

### Column Operations
- ✅ **Column Resizing** - Drag column edges to resize
- ✅ **Column Reordering** - Drag columns to reorder (suppressMovable)
- ✅ **Column Pinning** - Pin columns left or right
- ✅ **Column Hiding** - Show/hide via menu or panel
- ✅ **Column Menu** - Sort, filter, pin, hide options

### Selection
- ✅ **Row Selection** - Single or multiple row selection
- ✅ **Checkbox Selection** - checkboxSelection in columns
- ✅ **Header Checkbox** - Select all with tri-state checkbox
- ✅ **Filtered Selection** - headerCheckboxSelectionFilteredOnly

### Tool Panels
- ✅ **Columns Panel** (agColumnsToolPanel) - Show/hide columns with search
- ✅ **Filters Panel** (agFiltersToolPanel) - Manage active filters
- ✅ **Sidebar** - Configurable tool panel sidebar

### UI & Interaction
- ✅ **Context Menu** - Right-click menu with custom items
- ✅ **Pagination** - Client and server-side pagination
- ✅ **Export to CSV** - Export visible data
- ✅ **Loading overlays** - Customizable loading states
- ✅ **Custom cell renderers** - React components in cells
- ✅ **Value formatters** - Format display values
- ✅ **Tooltips** - Cell tooltips via tooltipField/tooltipValueGetter
- ✅ **Row animations** - Smooth transitions
- ✅ **Custom themes** - Cursed, Alpine, Balham, Material

### API Methods
- ✅ `api.getRowData()`, `api.setRowData()`
- ✅ `api.getSortModel()`, `api.setSortModel()`
- ✅ `api.getFilterModel()`, `api.setFilterModel()`
- ✅ `api.getSelectedRows()`, `api.selectAll()`, `api.deselectAll()`
- ✅ `api.exportDataAsCsv()`
- ✅ `api.setServerSideDatasource()`, `api.refreshServerSide()`
- ✅ `api.setGridOption()` (v32+ style)
- ✅ `columnApi.moveColumn()`, `columnApi.setColumnVisible()`

## Roadmap

- [ ] Row grouping with aggregation (aggFunc)
- [ ] Tree data (isServerSideGroup)
- [ ] Pivoting
- [ ] Virtual scrolling (row virtualization)
- [ ] Editable cells
- [ ] Master/Detail rows
- [ ] Cell range selection
- [ ] Advanced clipboard operations
- [ ] State persistence (localStorage/URL)
