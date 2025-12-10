import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, useCallback } from "react";
import {
  CursedGrid,
  type ColDef,
  type IServerSideDatasource,
  type IServerSideGetRowsParams,
  type IDatasource,
  type IGetRowsParams,
  type GridReadyEvent,
  type GridApi,
  type SortChangedEvent,
} from "../CursedGrid";

// ============================================================================
// SAMPLE DATA TYPES
// ============================================================================

interface Trade {
  id: number;
  product: string;
  portfolio: string;
  book: string;
  tradeDate: string;
  settleDate: string;
  quantity: number;
  price: number;
  currentValue: number;
  previousValue: number;
  pl: number;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  hireDate: string;
  status: "active" | "inactive" | "pending";
}

// ============================================================================
// DATA GENERATORS
// ============================================================================

const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
const products = ["Equity Swap", "Bond", "Option", "Future", "Forward", "CDS"];
const portfolios = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];
const books = ["NYC-1", "NYC-2", "LDN-1", "LDN-2", "HK-1", "TKY-1"];

function generateTrades(count: number): Trade[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    product: products[Math.floor(Math.random() * products.length)],
    portfolio: portfolios[Math.floor(Math.random() * portfolios.length)],
    book: books[Math.floor(Math.random() * books.length)],
    tradeDate: new Date(2024, 0, 1 + Math.floor(Math.random() * 365)).toISOString().split("T")[0],
    settleDate: new Date(2024, 0, 3 + Math.floor(Math.random() * 365)).toISOString().split("T")[0],
    quantity: Math.floor(Math.random() * 10000) + 100,
    price: Math.random() * 1000 + 10,
    currentValue: Math.random() * 1000000,
    previousValue: Math.random() * 1000000,
    pl: (Math.random() - 0.5) * 100000,
  }));
}

function generateEmployees(count: number): Employee[] {
  const firstNames = ["John", "Jane", "Bob", "Alice", "Charlie", "Diana", "Edward", "Fiona", "George", "Helen"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  const statuses: Employee["status"][] = ["active", "inactive", "pending"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    email: `employee${i + 1}@company.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 150000) + 50000,
    hireDate: new Date(2015 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split("T")[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
}

// Pre-generate large datasets
const TRADE_DATABASE = generateTrades(10000);
const EMPLOYEE_DATABASE = generateEmployees(5000);

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

const tradeColumnDefs: ColDef<Trade>[] = [
  { field: "id", headerName: "ID", width: 80, sortable: true },
  { field: "product", headerName: "Product", minWidth: 120, sortable: true },
  { field: "portfolio", headerName: "Portfolio", minWidth: 100, sortable: true },
  { field: "book", headerName: "Book", width: 100, sortable: true },
  { field: "tradeDate", headerName: "Trade Date", width: 120, sortable: true },
  { field: "quantity", headerName: "Quantity", width: 100, sortable: true,
    valueFormatter: ({ value }) => new Intl.NumberFormat().format(value as number),
  },
  { field: "price", headerName: "Price", width: 100, sortable: true,
    valueFormatter: ({ value }) => `$${(value as number).toFixed(2)}`,
  },
  { field: "currentValue", headerName: "Current Value", width: 130, sortable: true,
    valueFormatter: ({ value }) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value as number),
  },
  { field: "pl", headerName: "P&L", width: 120, sortable: true,
    valueFormatter: ({ value }) => {
      const v = value as number;
      const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Math.abs(v));
      return v >= 0 ? `+${formatted}` : `-${formatted}`;
    },
    cellClass: ({ value }) => (value as number) >= 0 ? "text-green-600" : "text-red-600",
  },
];

const employeeColumnDefs: ColDef<Employee>[] = [
  { field: "id", headerName: "ID", width: 80, sortable: true },
  { field: "name", headerName: "Name", minWidth: 150, sortable: true },
  { field: "email", headerName: "Email", minWidth: 200, sortable: true },
  { field: "department", headerName: "Department", minWidth: 120, sortable: true },
  { field: "salary", headerName: "Salary", width: 120, sortable: true,
    valueFormatter: ({ value }) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value as number),
  },
  { field: "hireDate", headerName: "Hire Date", width: 120, sortable: true },
  { field: "status", headerName: "Status", width: 100, sortable: true,
    cellClass: ({ value }) => {
      const status = value as string;
      if (status === "active") return "text-green-600";
      if (status === "inactive") return "text-red-600";
      return "text-yellow-600";
    },
  },
];

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof CursedGrid> = {
  title: "Components/CursedGrid/Server-Side Row Model",
  component: CursedGrid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# Server-Side Row Model

The Server-Side Row Model (SSRM) is designed for handling large datasets by loading data in blocks as users scroll or perform operations.

## Key Features

- **Lazy Loading**: Data is fetched on demand as users navigate through the grid
- **Server-Side Operations**: Sorting, filtering, grouping execute on the server
- **Infinite Scrolling**: Supports continuous scrolling through extensive datasets
- **Data Caching**: Caches data blocks on the client to minimize server requests

## AG Grid Enterprise 32.3.1 Compatibility

This implementation is compatible with AG Grid Enterprise 32.3.1 APIs including:

- \`rowModelType: 'serverSide'\`
- \`serverSideDatasource\` with \`IServerSideDatasource\` interface
- \`cacheBlockSize\` for block size configuration
- Full \`IServerSideGetRowsRequest\` with sortModel, filterModel, groupKeys
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Basic Server-Side Row Model with 10,000 trades
 */
export const BasicServerSide: StoryObj<typeof CursedGrid<Trade>> = {
  render: () => {
    const [gridApi, setGridApi] = useState<GridApi<Trade> | null>(null);
    const [lastRequest, setLastRequest] = useState<string>("");

    // Create the server-side datasource
    const datasource: IServerSideDatasource<Trade> = {
      getRows: (params: IServerSideGetRowsParams<Trade>) => {
        console.log("Server request:", params.request);
        setLastRequest(JSON.stringify(params.request, null, 2));

        // Simulate network delay
        setTimeout(() => {
          const { startRow, endRow, sortModel } = params.request;
          
          // Apply sorting if any
          let sortedData = [...TRADE_DATABASE];
          if (sortModel.length > 0) {
            sortedData.sort((a, b) => {
              for (const sort of sortModel) {
                const field = sort.colId as keyof Trade;
                const aVal = a[field];
                const bVal = b[field];
                
                let comparison = 0;
                if (typeof aVal === "number" && typeof bVal === "number") {
                  comparison = aVal - bVal;
                } else {
                  comparison = String(aVal).localeCompare(String(bVal));
                }
                
                if (sort.sort === "desc") comparison = -comparison;
                if (comparison !== 0) return comparison;
              }
              return 0;
            });
          }

          // Slice the data
          const rowData = sortedData.slice(startRow, endRow);
          
          // Call success with row data and total count
          params.success({
            rowData,
            rowCount: TRADE_DATABASE.length,
          });
        }, 500); // 500ms simulated latency
      },
    };

    const handleGridReady = (event: GridReadyEvent<Trade>) => {
      setGridApi(event.api);
    };

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Server-Side Row Model Demo</h3>
          <p className="text-sm text-muted-foreground mb-2">
            This grid loads 10,000 trades from a simulated server. Data is fetched in blocks of 100 rows.
            Click column headers to sort (server-side).
          </p>
          <p className="text-sm">
            <strong>Total Records:</strong> {TRADE_DATABASE.length.toLocaleString()}
          </p>
        </div>

        <div className="h-[500px]">
          <CursedGrid<Trade>
            rowModelType="serverSide"
            serverSideDatasource={datasource}
            columnDefs={tradeColumnDefs}
            cacheBlockSize={100}
            pagination
            paginationPageSize={20}
            onGridReady={handleGridReady}
            defaultColDef={{ sortable: true }}
            debug
          />
        </div>

        {lastRequest && (
          <details className="p-4 bg-muted rounded-lg">
            <summary className="cursor-pointer font-semibold">Last Server Request</summary>
            <pre className="mt-2 text-xs overflow-auto">{lastRequest}</pre>
          </details>
        )}
      </div>
    );
  },
};

/**
 * Infinite Scroll Row Model
 */
export const InfiniteScroll: StoryObj<typeof CursedGrid<Employee>> = {
  render: () => {
    const [loadCount, setLoadCount] = useState(0);

    const datasource: IDatasource<Employee> = {
      getRows: (params: IGetRowsParams<Employee>) => {
        console.log("Infinite scroll request:", params.startRow, params.endRow);
        setLoadCount((c) => c + 1);

        setTimeout(() => {
          const { startRow, endRow, sortModel } = params;
          
          let sortedData = [...EMPLOYEE_DATABASE];
          if (sortModel.length > 0) {
            sortedData.sort((a, b) => {
              for (const sort of sortModel) {
                const field = sort.colId as keyof Employee;
                const aVal = a[field];
                const bVal = b[field];
                
                let comparison = 0;
                if (typeof aVal === "number" && typeof bVal === "number") {
                  comparison = aVal - bVal;
                } else {
                  comparison = String(aVal).localeCompare(String(bVal));
                }
                
                if (sort.sort === "desc") comparison = -comparison;
                if (comparison !== 0) return comparison;
              }
              return 0;
            });
          }

          const rowData = sortedData.slice(startRow, endRow);
          params.successCallback(rowData, EMPLOYEE_DATABASE.length);
        }, 300);
      },
    };

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Infinite Scroll Demo</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Uses the simpler IDatasource interface for infinite scrolling through 5,000 employees.
          </p>
          <p className="text-sm">
            <strong>Server Requests:</strong> {loadCount}
          </p>
        </div>

        <div className="h-[500px]">
          <CursedGrid<Employee>
            rowModelType="infinite"
            datasource={datasource}
            columnDefs={employeeColumnDefs}
            cacheBlockSize={50}
            pagination
            paginationPageSize={25}
            defaultColDef={{ sortable: true }}
            debug
          />
        </div>
      </div>
    );
  },
};

/**
 * Client-Side with Sorting
 */
export const ClientSideSorting: StoryObj<typeof CursedGrid<Trade>> = {
  render: () => {
    const [sortInfo, setSortInfo] = useState<string>("No sort applied");

    const handleSortChanged = (event: SortChangedEvent<Trade>) => {
      const sortModel = event.api.getSortModel();
      if (sortModel.length === 0) {
        setSortInfo("No sort applied");
      } else {
        setSortInfo(
          sortModel
            .map((s, i) => `${i + 1}. ${s.colId} (${s.sort})`)
            .join(", ")
        );
      }
    };

    // Use smaller dataset for client-side
    const clientData = TRADE_DATABASE.slice(0, 100);

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Client-Side Sorting</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Click column headers to sort. Hold Ctrl/Cmd for multi-column sort.
          </p>
          <p className="text-sm">
            <strong>Current Sort:</strong> {sortInfo}
          </p>
        </div>

        <div className="h-[500px]">
          <CursedGrid<Trade>
            rowModelType="clientSide"
            rowData={clientData}
            columnDefs={tradeColumnDefs}
            pagination
            paginationPageSize={20}
            onSortChanged={handleSortChanged}
            defaultColDef={{ sortable: true }}
          />
        </div>
      </div>
    );
  },
};

/**
 * Enterprise Features Comparison
 */
export const EnterpriseFeatures: StoryObj<typeof CursedGrid<Trade>> = {
  render: () => {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">AG Grid Enterprise 32.3.1 Compatibility</h2>
          <p className="text-muted-foreground mb-6">
            CursedGrid implements key AG Grid Enterprise features to serve as a drop-in replacement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg">
              <h3 className="font-semibold text-green-600 mb-2">✅ Implemented</h3>
              <ul className="text-sm space-y-1">
                <li>• rowModelType: clientSide, serverSide, infinite</li>
                <li>• IServerSideDatasource interface</li>
                <li>• IServerSideGetRowsRequest with sortModel, filterModel</li>
                <li>• IDatasource for infinite scroll</li>
                <li>• cacheBlockSize configuration</li>
                <li>• Client-side & server-side sorting</li>
                <li>• Multi-column sorting (Ctrl+click)</li>
                <li>• api.setGridOption() (v32+ style)</li>
                <li>• api.refreshServerSide()</li>
                <li>• Pagination with server-side data</li>
              </ul>
            </div>

            <div className="p-4 bg-background rounded-lg">
              <h3 className="font-semibold text-yellow-600 mb-2">🚧 Roadmap</h3>
              <ul className="text-sm space-y-1">
                <li>• Row grouping (serverSideRowGroupPanelShow)</li>
                <li>• Aggregation (valueCols)</li>
                <li>• Pivoting (pivotCols)</li>
                <li>• Tree data (isServerSideGroup)</li>
                <li>• Column filters (floatingFilter)</li>
                <li>• Virtual scrolling (suppressRowVirtualisation)</li>
                <li>• Column resizing</li>
                <li>• Editable cells</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          <CursedGrid<Trade>
            rowModelType="clientSide"
            rowData={TRADE_DATABASE.slice(0, 50)}
            columnDefs={tradeColumnDefs}
            rowSelection="multiple"
            pagination
            paginationPageSize={10}
            animateRows
            defaultColDef={{ sortable: true }}
          />
        </div>
      </div>
    );
  },
};

/**
 * API Reference Demo
 */
export const ApiReference: StoryObj<typeof CursedGrid<Employee>> = {
  render: () => {
    const [gridApi, setGridApi] = useState<GridApi<Employee> | null>(null);
    const [output, setOutput] = useState<string>("");

    const handleGridReady = (event: GridReadyEvent<Employee>) => {
      setGridApi(event.api);
      setOutput("Grid is ready!");
    };

    const logOutput = (action: string, result: unknown) => {
      setOutput(`${action}:\n${JSON.stringify(result, null, 2)}`);
    };

    const clientData = EMPLOYEE_DATABASE.slice(0, 50);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
          <button
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => logOutput("getSortModel()", gridApi?.getSortModel())}
          >
            Get Sort Model
          </button>
          <button
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => {
              gridApi?.setSortModel([{ colId: "salary", sort: "desc" }]);
              logOutput("setSortModel()", [{ colId: "salary", sort: "desc" }]);
            }}
          >
            Sort by Salary (desc)
          </button>
          <button
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => {
              gridApi?.setSortModel([]);
              logOutput("Clear Sort", []);
            }}
          >
            Clear Sort
          </button>
          <button
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => logOutput("getSelectedRows()", gridApi?.getSelectedRows())}
          >
            Get Selected
          </button>
          <button
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => {
              gridApi?.selectAll();
              setOutput("Selected all rows");
            }}
          >
            Select All
          </button>
          <button
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => {
              gridApi?.deselectAll();
              setOutput("Deselected all rows");
            }}
          >
            Deselect All
          </button>
          <button
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => {
              gridApi?.exportDataAsCsv();
              setOutput("Exported to CSV");
            }}
          >
            Export CSV
          </button>
        </div>

        <div className="h-[400px]">
          <CursedGrid<Employee>
            rowData={clientData}
            columnDefs={employeeColumnDefs}
            rowSelection="multiple"
            pagination
            paginationPageSize={10}
            onGridReady={handleGridReady}
            defaultColDef={{ sortable: true }}
          />
        </div>

        {output && (
          <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-48">
            {output}
          </pre>
        )}
      </div>
    );
  },
};

