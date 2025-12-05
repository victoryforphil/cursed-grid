# Getting Started with CursedGrid

## Installation

CursedGrid is part of this monorepo. To use it in your project, import it directly:

```tsx
import { CursedGrid, type ColDef } from "@/components/grid";
```

## Prerequisites

- Node.js 18+
- React 18+ or React 19
- Tailwind CSS v4

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/victoryforphil/cursed-grid.git
cd cursed-grid
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Or start Storybook for component development:
```bash
npm run storybook
```

## Basic Example

```tsx
"use client";

import { CursedGrid, type ColDef } from "@/components/grid";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columnDefs: ColDef<User>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Name", minWidth: 150 },
  { field: "email", headerName: "Email", minWidth: 200 },
  { field: "role", headerName: "Role", minWidth: 120 },
];

const rowData: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
];

export default function UsersGrid() {
  return (
    <div className="h-[400px]">
      <CursedGrid<User>
        columnDefs={columnDefs}
        rowData={rowData}
        rowSelection="multiple"
        pagination
        paginationPageSize={10}
      />
    </div>
  );
}
```

## Using the Grid API

The Grid API provides programmatic control over the grid:

```tsx
import { useState } from "react";
import { CursedGrid, type GridApi, type GridReadyEvent } from "@/components/grid";

function MyGrid() {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const handleGridReady = (event: GridReadyEvent) => {
    setGridApi(event.api);
  };

  const handleExport = () => {
    gridApi?.exportDataAsCsv();
  };

  const handleSelectAll = () => {
    gridApi?.selectAll();
  };

  return (
    <div>
      <div className="mb-4 space-x-2">
        <button onClick={handleSelectAll}>Select All</button>
        <button onClick={handleExport}>Export CSV</button>
      </div>
      <CursedGrid
        columnDefs={columnDefs}
        rowData={rowData}
        onGridReady={handleGridReady}
      />
    </div>
  );
}
```

## Custom Cell Renderers

You can customize how cells are rendered:

```tsx
function StatusBadge({ value }: { value: unknown }) {
  const status = value as string;
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    inactive: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded ${colors[status] || ""}`}>
      {status}
    </span>
  );
}

const columnDefs: ColDef[] = [
  { field: "name", headerName: "Name" },
  { 
    field: "status", 
    headerName: "Status",
    cellRenderer: StatusBadge,
  },
];
```

## Value Formatters

Format values for display without changing the underlying data:

```tsx
const columnDefs: ColDef[] = [
  { field: "name", headerName: "Name" },
  { 
    field: "salary", 
    headerName: "Salary",
    valueFormatter: ({ value }) => 
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value as number),
  },
  {
    field: "date",
    headerName: "Date",
    valueFormatter: ({ value }) =>
      new Date(value as string).toLocaleDateString(),
  },
];
```

## Next Steps

- Explore the [API Reference](./api-reference.md)
- Learn about [Column Definitions](./column-definitions.md)
- Check out more [Examples](./examples.md)
