# CursedGrid

A high-performance, **AG Grid Enterprise 32.3.1 compatible** data grid component library for React applications.

> A drop-in replacement for AG Grid Enterprise with ~75% feature parity. No license required.

## 🌟 Key Features

- 🚀 **AG Grid Enterprise 32.3.1 API** - Drop-in replacement for most use cases
- 📊 **Server-Side Row Model** - Enterprise-grade lazy loading with `IServerSideDatasource`
- 🔍 **Advanced Filtering** - Text, Number, Set, Date filters with floating filters
- ↕️ **Multi-Column Sorting** - Client and server-side sorting
- ☑️ **Checkbox Selection** - Row selection with header checkbox
- 📍 **Column Operations** - Resize, reorder, pin, hide columns
- ⚛️ **React 19 Native** - Built for modern React
- 📝 **TypeScript First** - Full type safety
- 🎨 **Shadcn UI Styled** - Beautiful, accessible components
- 🌙 **Dark Mode** - Automatic dark mode support
- 📖 **Storybook** - Interactive documentation
- 💰 **No License Fees** - 100% open source

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start the demo site
npm run dev

# Start Storybook for component development
npm run storybook
```

### Using CursedGrid

```tsx
import { CursedGrid, type ColDef } from "@/components/grid";

interface Person {
  id: number;
  name: string;
  email: string;
}

const columnDefs: ColDef<Person>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Name" },
  { field: "email", headerName: "Email" },
];

const rowData: Person[] = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
];

function MyGrid() {
  return (
    <CursedGrid<Person>
      columnDefs={columnDefs}
      rowData={rowData}
      rowSelection="multiple"
      pagination
      paginationPageSize={10}
    />
  );
}
```

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) design system
- **Documentation**: [Storybook 10](https://storybook.js.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Project Structure

```
cursed-grid/
├── .devcontainer/          # Dev container for Codespaces
├── .storybook/             # Storybook configuration
├── doc/                    # Documentation
├── src/
│   ├── app/                # Next.js app router
│   ├── components/
│   │   ├── demo/           # Demo components
│   │   ├── grid/           # CursedGrid library
│   │   └── ui/             # Shadcn UI components
│   └── lib/                # Utilities
└── public/                 # Static assets
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run storybook` | Start Storybook |
| `npm run build-storybook` | Build Storybook static site |

## Documentation

### 📚 Comprehensive Guides

- **[FEATURES.md](./FEATURES.md)** - Complete feature list and quick start
- **[AG Grid Compatibility](./doc/ag-grid-compatibility.md)** - Enterprise 32.3.1 compatibility matrix
- [Getting Started](./doc/getting-started.md) - Installation and basic usage
- [API Reference](./doc/api-reference.md) - Complete API documentation
- [Column Definitions](./doc/column-definitions.md) - Column configuration guide
- [Examples](./doc/examples.md) - Code examples

### 🎯 For AG Grid Users

If you're migrating from AG Grid Enterprise, start here:
1. Read [ag-grid-compatibility.md](./doc/ag-grid-compatibility.md) for feature coverage
2. Check [FEATURES.md](./FEATURES.md) for implementation status
3. Review [API Reference](./doc/api-reference.md) for API differences

## Development with Codespaces

This project includes a devcontainer configuration for GitHub Codespaces with:

- Node.js 22
- Zsh with Oh My Zsh
- Starship prompt
- Pre-configured VS Code extensions

## License

GPL-3.0 - See [LICENSE](./LICENSE) for details.
