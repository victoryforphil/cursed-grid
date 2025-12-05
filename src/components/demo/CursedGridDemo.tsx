"use client";

import * as React from "react";
import { CursedGrid, type ColDef, type GridReadyEvent, type GridApi, type ColumnApi } from "@/components/grid";
import { Button } from "@/components/ui/button";

// Sample data type
interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  startDate: string;
  status: "Active" | "On Leave" | "Terminated";
}

// Sample data
const sampleData: Employee[] = [
  { id: 1, name: "John Doe", email: "john@example.com", department: "Engineering", role: "Senior Developer", salary: 120000, startDate: "2020-01-15", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", department: "Design", role: "Lead Designer", salary: 110000, startDate: "2019-03-20", status: "Active" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", department: "Engineering", role: "Junior Developer", salary: 75000, startDate: "2022-06-01", status: "Active" },
  { id: 4, name: "Alice Williams", email: "alice@example.com", department: "Marketing", role: "Marketing Manager", salary: 95000, startDate: "2021-02-10", status: "On Leave" },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", department: "Engineering", role: "DevOps Engineer", salary: 115000, startDate: "2020-08-25", status: "Active" },
  { id: 6, name: "Diana Ross", email: "diana@example.com", department: "HR", role: "HR Specialist", salary: 70000, startDate: "2023-01-05", status: "Active" },
  { id: 7, name: "Edward Norton", email: "edward@example.com", department: "Finance", role: "Financial Analyst", salary: 85000, startDate: "2021-11-15", status: "Active" },
  { id: 8, name: "Fiona Apple", email: "fiona@example.com", department: "Design", role: "UX Designer", salary: 90000, startDate: "2022-04-20", status: "Active" },
  { id: 9, name: "George Lucas", email: "george@example.com", department: "Engineering", role: "Tech Lead", salary: 140000, startDate: "2018-07-01", status: "Active" },
  { id: 10, name: "Hannah Montana", email: "hannah@example.com", department: "Marketing", role: "Content Writer", salary: 65000, startDate: "2023-03-15", status: "Terminated" },
  { id: 11, name: "Ian McKellen", email: "ian@example.com", department: "Engineering", role: "Staff Engineer", salary: 155000, startDate: "2017-05-20", status: "Active" },
  { id: 12, name: "Julia Roberts", email: "julia@example.com", department: "Sales", role: "Sales Director", salary: 130000, startDate: "2019-09-10", status: "Active" },
  { id: 13, name: "Kevin Hart", email: "kevin@example.com", department: "Engineering", role: "Frontend Developer", salary: 95000, startDate: "2021-08-01", status: "Active" },
  { id: 14, name: "Lisa Simpson", email: "lisa@example.com", department: "Research", role: "Data Scientist", salary: 125000, startDate: "2020-12-01", status: "Active" },
  { id: 15, name: "Michael Scott", email: "michael@example.com", department: "Management", role: "Regional Manager", salary: 100000, startDate: "2015-03-15", status: "Active" },
];

// Status cell renderer
function StatusCellRenderer({ value }: { value: unknown }) {
  const status = value as Employee["status"];
  const colors: Record<Employee["status"], string> = {
    Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "On Leave": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Terminated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}

// Column definitions
const columnDefs: ColDef<Employee>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Name", minWidth: 150 },
  { field: "email", headerName: "Email", minWidth: 200 },
  { field: "department", headerName: "Department", minWidth: 120 },
  { field: "role", headerName: "Role", minWidth: 150 },
  { 
    field: "salary", 
    headerName: "Salary", 
    width: 120,
    valueFormatter: ({ value }) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value as number);
    },
  },
  { field: "startDate", headerName: "Start Date", width: 120 },
  { 
    field: "status", 
    headerName: "Status", 
    width: 120,
    cellRenderer: StatusCellRenderer,
  },
];

export function CursedGridDemo() {
  const [gridApi, setGridApi] = React.useState<GridApi<Employee> | null>(null);
  // Column API is available for future column operations
  const [, setColumnApi] = React.useState<ColumnApi<Employee> | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<Employee[]>([]);

  const handleGridReady = (event: GridReadyEvent<Employee>) => {
    setGridApi(event.api);
    setColumnApi(event.columnApi);
  };

  const handleExportCsv = () => {
    gridApi?.exportDataAsCsv();
  };

  const handleSelectAll = () => {
    gridApi?.selectAll();
  };

  const handleDeselectAll = () => {
    gridApi?.deselectAll();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="p-4 border-b bg-muted/30 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2" role="toolbar" aria-label="Grid actions">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll}
            aria-label="Select all rows in the employee grid"
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDeselectAll}
            aria-label="Deselect all rows in the employee grid"
          >
            Deselect All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCsv}
            aria-label="Export employee data as CSV file"
          >
            Export CSV
          </Button>
        </div>
        <div className="text-sm text-muted-foreground" aria-live="polite">
          {selectedRows.length > 0 && (
            <span>{selectedRows.length} row(s) selected</span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="h-[500px]">
        <CursedGrid<Employee>
          columnDefs={columnDefs}
          rowData={sampleData}
          rowSelection="multiple"
          pagination
          paginationPageSize={10}
          animateRows
          defaultColDef={{
            sortable: true,
            resizable: true,
          }}
          getRowId={({ data }) => String(data.id)}
          onGridReady={handleGridReady}
          onSelectionChanged={(event) => setSelectedRows(event.selectedRows)}
        />
      </div>
    </div>
  );
}
