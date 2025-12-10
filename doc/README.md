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

- ✅ AG Grid-compatible API
- ✅ TypeScript support
- ✅ Row selection (single/multiple)
- ✅ Pagination
- ✅ Custom cell renderers
- ✅ Value formatters
- ✅ Value getters
- ✅ Column pinning
- ✅ Export to CSV
- ✅ Dark mode support
- ✅ Storybook documentation

## Roadmap

- [ ] Sorting
- [ ] Filtering
- [ ] Column resizing
- [ ] Row grouping
- [ ] Tree data
- [ ] Virtual scrolling
- [ ] Column reordering
- [ ] Editable cells
