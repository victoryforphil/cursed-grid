import { CursedGridDemo } from "@/components/demo/CursedGridDemo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">CursedGrid</h1>
          <p className="text-muted-foreground mt-2">
            A high-performance, AG Grid-compatible data grid component library
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Demo</h2>
            <div className="border rounded-lg overflow-hidden">
              <CursedGridDemo />
            </div>
          </section>

          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">AG Grid Compatible</h3>
              <p className="text-muted-foreground text-sm">
                Familiar API design inspired by AG Grid, making migration seamless.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">React First</h3>
              <p className="text-muted-foreground text-sm">
                Built with React and TypeScript for type-safe, modern development.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Shadcn UI Styled</h3>
              <p className="text-muted-foreground text-sm">
                Beautiful, accessible components using Shadcn UI design system.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Row Selection</h3>
              <p className="text-muted-foreground text-sm">
                Single and multiple row selection with customizable behavior.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Pagination</h3>
              <p className="text-muted-foreground text-sm">
                Built-in pagination with configurable page sizes.
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Export to CSV</h3>
              <p className="text-muted-foreground text-sm">
                Export your data to CSV with a single API call.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="p-6 border rounded-lg bg-card">
              <pre className="text-sm overflow-x-auto">
                <code>{`import { CursedGrid } from "@/components/grid";

const columnDefs = [
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email" },
  { field: "status", headerName: "Status" },
];

const rowData = [
  { name: "John Doe", email: "john@example.com", status: "Active" },
  // ...more data
];

function MyTable() {
  return (
    <CursedGrid
      columnDefs={columnDefs}
      rowData={rowData}
      rowSelection="multiple"
      pagination
      paginationPageSize={10}
    />
  );
}`}</code>
              </pre>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          CursedGrid - Built with Next.js, React, and Shadcn UI
        </div>
      </footer>
    </div>
  );
}
