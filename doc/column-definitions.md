# Column Definitions

Column definitions control how columns are displayed and behave in the grid.

## Basic Column Definition

The simplest column definition only requires a `field`:

```tsx
const columnDefs = [
  { field: "name" },
  { field: "email" },
  { field: "age" },
];
```

## With Header Names

Add custom header text:

```tsx
const columnDefs = [
  { field: "name", headerName: "Full Name" },
  { field: "email", headerName: "Email Address" },
  { field: "age", headerName: "Age" },
];
```

## Column Width

Control column sizing:

```tsx
const columnDefs = [
  { field: "id", width: 80 },              // Fixed width
  { field: "name", minWidth: 150 },        // Minimum width
  { field: "description", maxWidth: 300 }, // Maximum width
  { field: "notes", flex: 1 },             // Flexible width
];
```

## Column Pinning

Pin columns to left or right:

```tsx
const columnDefs = [
  { field: "id", pinned: "left" },
  { field: "name" },
  { field: "email" },
  { field: "actions", pinned: "right" },
];
```

## Hidden Columns

Hide columns while keeping them in the column list:

```tsx
const columnDefs = [
  { field: "id", hide: true },
  { field: "name" },
  { field: "email" },
];
```

## Value Formatters

Format displayed values without modifying the data:

```tsx
const columnDefs = [
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
    field: "createdAt",
    headerName: "Created",
    valueFormatter: ({ value }) =>
      new Date(value as string).toLocaleDateString(),
  },
  {
    field: "percentage",
    headerName: "Completion",
    valueFormatter: ({ value }) => `${value}%`,
  },
];
```

## Value Getters

Compute values from row data:

```tsx
const columnDefs = [
  { field: "firstName" },
  { field: "lastName" },
  {
    headerName: "Full Name",
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
  },
  {
    headerName: "Total",
    valueGetter: ({ data }) => data.quantity * data.price,
    valueFormatter: ({ value }) => `$${value.toFixed(2)}`,
  },
];
```

## Cell Renderers

Custom React components for cell rendering:

```tsx
// Status badge component
function StatusBadge({ value }: CellRendererParams) {
  const status = value as string;
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    inactive: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colors[status]}`}>
      {status}
    </span>
  );
}

// Progress bar component
function ProgressBar({ value }: CellRendererParams) {
  const progress = value as number;
  return (
    <div className="w-full bg-gray-200 rounded h-2">
      <div 
        className="bg-blue-500 h-2 rounded" 
        style={{ width: `${progress}%` }} 
      />
    </div>
  );
}

// Action buttons component
function ActionButtons({ data }: CellRendererParams) {
  return (
    <div className="flex gap-2">
      <button onClick={() => handleEdit(data)}>Edit</button>
      <button onClick={() => handleDelete(data)}>Delete</button>
    </div>
  );
}

const columnDefs = [
  { field: "name" },
  { field: "status", cellRenderer: StatusBadge },
  { field: "progress", cellRenderer: ProgressBar },
  { headerName: "Actions", cellRenderer: ActionButtons },
];
```

## Cell Classes

Add CSS classes to cells:

```tsx
const columnDefs = [
  // Static class
  { field: "name", cellClass: "font-bold" },
  
  // Dynamic class based on value
  {
    field: "status",
    cellClass: ({ value }) => {
      if (value === "active") return "text-green-600";
      if (value === "inactive") return "text-red-600";
      return "";
    },
  },
  
  // Conditional class based on data
  {
    field: "salary",
    cellClass: ({ data }) => 
      data.salary > 100000 ? "bg-yellow-50" : "",
  },
];
```

## Header Classes

Style column headers:

```tsx
const columnDefs = [
  { field: "important", headerClass: "bg-yellow-100 font-bold" },
  { field: "name", headerClass: "text-left" },
];
```

## Default Column Definition

Apply settings to all columns:

```tsx
<CursedGrid
  columnDefs={columnDefs}
  rowData={rowData}
  defaultColDef={{
    sortable: true,
    resizable: true,
    minWidth: 100,
  }}
/>
```

## Complete Example

```tsx
import { CursedGrid, type ColDef, type CellRendererParams } from "@/components/grid";

interface Order {
  id: number;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  status: "pending" | "shipped" | "delivered";
  date: string;
}

function StatusBadge({ value }: CellRendererParams<Order>) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colors[value as keyof typeof colors]}`}>
      {value as string}
    </span>
  );
}

const columnDefs: ColDef<Order>[] = [
  { field: "id", headerName: "Order ID", width: 100, pinned: "left" },
  { field: "customer", headerName: "Customer", minWidth: 150 },
  { field: "product", headerName: "Product", minWidth: 150 },
  { field: "quantity", headerName: "Qty", width: 80 },
  {
    field: "price",
    headerName: "Unit Price",
    width: 120,
    valueFormatter: ({ value }) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value as number),
  },
  {
    headerName: "Total",
    width: 120,
    valueGetter: ({ data }) => data.quantity * data.price,
    valueFormatter: ({ value }) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value as number),
  },
  { field: "status", headerName: "Status", width: 120, cellRenderer: StatusBadge },
  {
    field: "date",
    headerName: "Order Date",
    width: 120,
    valueFormatter: ({ value }) => new Date(value as string).toLocaleDateString(),
  },
];

function OrdersGrid({ orders }: { orders: Order[] }) {
  return (
    <CursedGrid<Order>
      columnDefs={columnDefs}
      rowData={orders}
      rowSelection="multiple"
      pagination
      paginationPageSize={20}
      defaultColDef={{
        sortable: true,
        resizable: true,
      }}
    />
  );
}
```
