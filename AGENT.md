# Agent Instructions

This document provides instructions for AI agents working with the CursedGrid repository.

## Project Overview

CursedGrid is a high-performance, AG Grid-compatible data grid component library built with:
- **Next.js** - React framework for the demo site
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Shadcn UI** - Component design system
- **Storybook** - Component development and documentation

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (Next.js)
npm run dev

# Start Storybook for component development
npm run storybook

# Build the project
npm run build

# Build Storybook static site
npm run build-storybook

# Run linter
npm run lint
```

## Project Structure

```
cursed-grid/
├── .devcontainer/          # Dev container configuration
├── .storybook/             # Storybook configuration
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── globals.css     # Global styles with CSS variables
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Demo home page
│   ├── components/
│   │   ├── demo/           # Demo components
│   │   ├── grid/           # CursedGrid component library
│   │   │   ├── CursedGrid.tsx    # Main grid component
│   │   │   ├── types.ts          # TypeScript types
│   │   │   ├── index.ts          # Exports
│   │   │   └── stories/          # Storybook stories
│   │   └── ui/             # Shadcn UI components
│   └── lib/
│       └── utils.ts        # Utility functions (cn, etc.)
├── public/                 # Static assets
└── doc/                    # Documentation
```

## CursedGrid Component

### Basic Usage

```tsx
import { CursedGrid, type ColDef } from "@/components/grid";

interface Person {
  id: number;
  name: string;
  email: string;
}

const columnDefs: ColDef<Person>[] = [
  { field: "id", headerName: "ID" },
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email" },
];

const rowData: Person[] = [
  { id: 1, name: "John Doe", email: "john@example.com" },
];

function MyGrid() {
  return (
    <CursedGrid
      columnDefs={columnDefs}
      rowData={rowData}
      rowSelection="multiple"
      pagination
    />
  );
}
```

### Key Props (AG Grid Compatible)

- `rowData` - Array of data to display
- `columnDefs` - Column definitions array
- `defaultColDef` - Default column settings
- `rowSelection` - "single" | "multiple" | null
- `pagination` - Enable pagination
- `paginationPageSize` - Rows per page
- `animateRows` - Enable row animations
- `onGridReady` - Callback when grid is initialized
- `onSelectionChanged` - Callback when selection changes
- `onCellClicked` - Callback when cell is clicked

### Column Definition Properties

```typescript
interface ColDef<TData> {
  field?: string;           // Data field name
  headerName?: string;      // Column header text
  width?: number;           // Column width
  minWidth?: number;        // Minimum width
  maxWidth?: number;        // Maximum width
  flex?: number;            // Flex grow
  hide?: boolean;           // Hide column
  pinned?: "left" | "right"; // Pin column
  cellRenderer?: Component; // Custom cell renderer
  valueFormatter?: Function; // Format cell value
  valueGetter?: Function;   // Custom value getter
}
```

## Styling

The project uses Tailwind CSS v4 with Shadcn UI-style CSS variables:

- Use `hsl(var(--variable))` for colors
- Use `cn()` utility for conditional classes
- CSS variables are defined in `src/app/globals.css`

## Adding New Components

1. Create component in `src/components/grid/` or `src/components/ui/`
2. Export from the appropriate index file
3. Add Storybook stories in the `stories/` folder
4. Follow existing patterns and naming conventions

## Testing

Run Storybook to visually test components:
```bash
npm run storybook
```

## Common Tasks

### Add a new grid feature
1. Update `types.ts` with new type definitions
2. Implement in `CursedGrid.tsx`
3. Add story in `stories/`
4. Update demo if needed

### Add a new UI component
1. Create in `src/components/ui/`
2. Follow Shadcn UI patterns
3. Export from component file

### Fix styling issues
1. Check `globals.css` for CSS variables
2. Verify Tailwind classes are correct
3. Check dark mode support
