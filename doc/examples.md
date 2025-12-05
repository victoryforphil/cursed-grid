# Examples

## Basic Grid

A simple grid with static data:

```tsx
"use client";

import { CursedGrid, type ColDef } from "@/components/grid";

interface User {
  id: number;
  name: string;
  email: string;
}

const columnDefs: ColDef<User>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email" },
];

const rowData: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com" },
];

export function BasicGrid() {
  return <CursedGrid<User> columnDefs={columnDefs} rowData={rowData} />;
}
```

## Grid with Row Selection

Enable selecting rows:

```tsx
"use client";

import { useState } from "react";
import { CursedGrid, type ColDef, type SelectionChangedEvent } from "@/components/grid";

interface Product {
  id: number;
  name: string;
  price: number;
}

const columnDefs: ColDef<Product>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Product Name" },
  { 
    field: "price", 
    headerName: "Price",
    valueFormatter: ({ value }) => `$${(value as number).toFixed(2)}`,
  },
];

const products: Product[] = [
  { id: 1, name: "Widget", price: 9.99 },
  { id: 2, name: "Gadget", price: 19.99 },
  { id: 3, name: "Doohickey", price: 29.99 },
];

export function SelectionGrid() {
  const [selected, setSelected] = useState<Product[]>([]);

  const handleSelectionChanged = (event: SelectionChangedEvent<Product>) => {
    setSelected(event.selectedRows);
  };

  return (
    <div>
      <p className="mb-4">
        Selected: {selected.map(p => p.name).join(", ") || "None"}
      </p>
      <CursedGrid<Product>
        columnDefs={columnDefs}
        rowData={products}
        rowSelection="multiple"
        onSelectionChanged={handleSelectionChanged}
      />
    </div>
  );
}
```

## Grid with Pagination

Large datasets with pagination:

```tsx
"use client";

import { CursedGrid, type ColDef } from "@/components/grid";

interface Employee {
  id: number;
  name: string;
  department: string;
  salary: number;
}

// Generate sample data
const employees: Employee[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  department: ["Engineering", "Sales", "Marketing", "HR"][i % 4],
  salary: 50000 + Math.random() * 100000,
}));

const columnDefs: ColDef<Employee>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Name" },
  { field: "department", headerName: "Department" },
  {
    field: "salary",
    headerName: "Salary",
    valueFormatter: ({ value }) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value as number),
  },
];

export function PaginatedGrid() {
  return (
    <CursedGrid<Employee>
      columnDefs={columnDefs}
      rowData={employees}
      pagination
      paginationPageSize={10}
    />
  );
}
```

## Grid with API Access

Using the Grid API for programmatic control:

```tsx
"use client";

import { useState } from "react";
import { 
  CursedGrid, 
  type ColDef, 
  type GridApi, 
  type GridReadyEvent 
} from "@/components/grid";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const columnDefs: ColDef<Task>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "title", headerName: "Task" },
  { 
    field: "completed", 
    headerName: "Status",
    valueFormatter: ({ value }) => value ? "✓ Done" : "○ Pending",
  },
];

const tasks: Task[] = [
  { id: 1, title: "Complete project", completed: false },
  { id: 2, title: "Review code", completed: true },
  { id: 3, title: "Write tests", completed: false },
];

export function ApiGrid() {
  const [gridApi, setGridApi] = useState<GridApi<Task> | null>(null);

  const handleGridReady = (event: GridReadyEvent<Task>) => {
    setGridApi(event.api);
  };

  const handleSelectAll = () => gridApi?.selectAll();
  const handleDeselectAll = () => gridApi?.deselectAll();
  const handleExport = () => gridApi?.exportDataAsCsv();

  return (
    <div>
      <div className="mb-4 space-x-2">
        <button 
          onClick={handleSelectAll}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Select All
        </button>
        <button 
          onClick={handleDeselectAll}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Deselect All
        </button>
        <button 
          onClick={handleExport}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Export CSV
        </button>
      </div>
      <CursedGrid<Task>
        columnDefs={columnDefs}
        rowData={tasks}
        rowSelection="multiple"
        onGridReady={handleGridReady}
      />
    </div>
  );
}
```

## Grid with Custom Cell Renderers

Rich cell content with custom components:

```tsx
"use client";

import { CursedGrid, type ColDef, type CellRendererParams } from "@/components/grid";

interface Issue {
  id: number;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  assignee: {
    name: string;
    avatar: string;
  };
}

// Priority badge component
function PriorityBadge({ value }: CellRendererParams<Issue>) {
  const priority = value as Issue["priority"];
  const colors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
}

// Progress bar component
function ProgressBar({ value }: CellRendererParams<Issue>) {
  const progress = value as number;
  const getColor = (p: number) => {
    if (p >= 80) return "bg-green-500";
    if (p >= 50) return "bg-blue-500";
    if (p >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-full ${getColor(progress)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8">{progress}%</span>
    </div>
  );
}

// Avatar component
function AssigneeCell({ data }: CellRendererParams<Issue>) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={data.assignee.avatar}
        alt={data.assignee.name}
        className="w-6 h-6 rounded-full"
      />
      <span>{data.assignee.name}</span>
    </div>
  );
}

const columnDefs: ColDef<Issue>[] = [
  { field: "id", headerName: "#", width: 60 },
  { field: "title", headerName: "Issue", minWidth: 200 },
  { field: "priority", headerName: "Priority", width: 100, cellRenderer: PriorityBadge },
  { field: "progress", headerName: "Progress", width: 150, cellRenderer: ProgressBar },
  { headerName: "Assignee", width: 150, cellRenderer: AssigneeCell },
];

const issues: Issue[] = [
  { 
    id: 1, 
    title: "Fix login bug", 
    priority: "critical", 
    progress: 75,
    assignee: { name: "John", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" }
  },
  { 
    id: 2, 
    title: "Improve performance", 
    priority: "high", 
    progress: 30,
    assignee: { name: "Jane", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" }
  },
  { 
    id: 3, 
    title: "Add dark mode", 
    priority: "medium", 
    progress: 90,
    assignee: { name: "Bob", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" }
  },
];

export function CustomRenderersGrid() {
  return (
    <CursedGrid<Issue>
      columnDefs={columnDefs}
      rowData={issues}
      rowHeight={50}
    />
  );
}
```

## Loading State

Show loading indicator while fetching data:

```tsx
"use client";

import { useState, useEffect } from "react";
import { CursedGrid, type ColDef } from "@/components/grid";

interface Data {
  id: number;
  value: string;
}

const columnDefs: ColDef<Data>[] = [
  { field: "id", headerName: "ID" },
  { field: "value", headerName: "Value" },
];

export function LoadingGrid() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Data[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setData([
        { id: 1, value: "Data loaded!" },
        { id: 2, value: "More data" },
      ]);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <CursedGrid<Data>
      columnDefs={columnDefs}
      rowData={data}
      loading={loading}
      overlayLoadingTemplate="Fetching data..."
    />
  );
}
```

## Empty State

Custom message when no data:

```tsx
"use client";

import { CursedGrid, type ColDef } from "@/components/grid";

interface Item {
  id: number;
  name: string;
}

const columnDefs: ColDef<Item>[] = [
  { field: "id", headerName: "ID" },
  { field: "name", headerName: "Name" },
];

export function EmptyGrid() {
  return (
    <CursedGrid<Item>
      columnDefs={columnDefs}
      rowData={[]}
      overlayNoRowsTemplate="No items found. Try adjusting your filters."
    />
  );
}
```
