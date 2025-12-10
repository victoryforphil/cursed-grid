import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CursedGrid, type ColDef } from "../CursedGrid";

// Sample data type
interface Person {
  id: number;
  name: string;
  email: string;
  age: number;
  city: string;
}

// Sample data
const sampleData: Person[] = [
  { id: 1, name: "John Doe", email: "john@example.com", age: 32, city: "New York" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", age: 28, city: "Los Angeles" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 45, city: "Chicago" },
  { id: 4, name: "Alice Williams", email: "alice@example.com", age: 35, city: "Houston" },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", age: 29, city: "Phoenix" },
  { id: 6, name: "Diana Ross", email: "diana@example.com", age: 42, city: "Philadelphia" },
  { id: 7, name: "Edward Norton", email: "edward@example.com", age: 38, city: "San Antonio" },
  { id: 8, name: "Fiona Apple", email: "fiona@example.com", age: 31, city: "San Diego" },
];

const columnDefs: ColDef<Person>[] = [
  { field: "id", headerName: "ID", width: 80, sortable: true },
  { field: "name", headerName: "Name", minWidth: 150, sortable: true },
  { field: "email", headerName: "Email", minWidth: 200, sortable: true },
  { field: "age", headerName: "Age", width: 100, sortable: true },
  { field: "city", headerName: "City", minWidth: 120, sortable: true },
];

const meta: Meta<typeof CursedGrid<Person>> = {
  title: "Components/CursedGrid",
  component: CursedGrid,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    rowSelection: {
      control: "select",
      options: [null, "single", "multiple"],
    },
    theme: {
      control: "select",
      options: ["cursed", "alpine", "balham", "material"],
    },
    domLayout: {
      control: "select",
      options: ["normal", "autoHeight", "print"],
    },
    rowModelType: {
      control: "select",
      options: ["clientSide", "serverSide", "infinite"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CursedGrid<Person>>;

/**
 * Basic grid with minimal configuration
 */
export const Basic: Story = {
  args: {
    columnDefs,
    rowData: sampleData,
  },
};

/**
 * Grid with row selection enabled
 */
export const WithRowSelection: Story = {
  args: {
    columnDefs,
    rowData: sampleData,
    rowSelection: "multiple",
  },
};

/**
 * Grid with single row selection
 */
export const SingleRowSelection: Story = {
  args: {
    columnDefs,
    rowData: sampleData,
    rowSelection: "single",
  },
};

/**
 * Grid with pagination
 */
export const WithPagination: Story = {
  args: {
    columnDefs,
    rowData: sampleData,
    pagination: true,
    paginationPageSize: 5,
  },
};

/**
 * Grid in loading state
 */
export const Loading: Story = {
  args: {
    columnDefs,
    rowData: sampleData,
    loading: true,
  },
};

/**
 * Grid with no data
 */
export const Empty: Story = {
  args: {
    columnDefs,
    rowData: [],
    overlayNoRowsTemplate: "No employees found",
  },
};

/**
 * Grid with row animations
 */
export const WithAnimations: Story = {
  args: {
    columnDefs,
    rowData: sampleData,
    animateRows: true,
    rowSelection: "multiple",
  },
};

/**
 * Grid with custom row height
 */
export const CustomRowHeight: Story = {
  args: {
    columnDefs,
    rowData: sampleData,
    rowHeight: 60,
    headerHeight: 50,
  },
};

/**
 * Full featured grid with all options
 */
export const FullFeatured: Story = {
  args: {
    columnDefs,
    rowData: sampleData,
    rowSelection: "multiple",
    pagination: true,
    paginationPageSize: 5,
    animateRows: true,
    defaultColDef: {
      sortable: true,
      resizable: true,
    },
  },
};
