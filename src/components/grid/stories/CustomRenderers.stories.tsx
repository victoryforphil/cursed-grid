import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CursedGrid, type ColDef, type CellRendererParams } from "../CursedGrid";

// Employee data type
interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  status: "Active" | "On Leave" | "Terminated";
  performance: number;
}

// Sample employee data
const employeeData: Employee[] = [
  { id: 1, name: "John Doe", email: "john@example.com", department: "Engineering", salary: 120000, status: "Active", performance: 95 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", department: "Design", salary: 110000, status: "Active", performance: 88 },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", department: "Engineering", salary: 75000, status: "On Leave", performance: 72 },
  { id: 4, name: "Alice Williams", email: "alice@example.com", department: "Marketing", salary: 95000, status: "Active", performance: 91 },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", department: "Engineering", salary: 115000, status: "Terminated", performance: 45 },
  { id: 6, name: "Diana Ross", email: "diana@example.com", department: "HR", salary: 70000, status: "Active", performance: 85 },
];

// Custom Status Badge Renderer
function StatusBadge({ value }: CellRendererParams<Employee>) {
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

// Custom Performance Bar Renderer
function PerformanceBar({ value }: CellRendererParams<Employee>) {
  const performance = value as number;
  const getColor = (perf: number) => {
    if (perf >= 80) return "bg-green-500";
    if (perf >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(performance)} transition-all`}
          style={{ width: `${performance}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8">{performance}%</span>
    </div>
  );
}

const columnDefs: ColDef<Employee>[] = [
  { field: "id", headerName: "ID", width: 60 },
  { field: "name", headerName: "Employee Name", minWidth: 150 },
  { field: "email", headerName: "Email Address", minWidth: 200 },
  { field: "department", headerName: "Department", minWidth: 120 },
  {
    field: "salary",
    headerName: "Salary",
    width: 120,
    valueFormatter: ({ value }) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value as number),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    cellRenderer: StatusBadge,
  },
  {
    field: "performance",
    headerName: "Performance",
    minWidth: 150,
    cellRenderer: PerformanceBar,
  },
];

const meta: Meta<typeof CursedGrid<Employee>> = {
  title: "Examples/Custom Cell Renderers",
  component: CursedGrid,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CursedGrid<Employee>>;

/**
 * Grid with custom cell renderers for status badges and performance bars
 */
export const CustomRenderers: Story = {
  args: {
    columnDefs,
    rowData: employeeData,
    rowSelection: "multiple",
    pagination: true,
    paginationPageSize: 10,
  },
};
