# CursedGrid

A high-performance, AG Grid-compatible data grid component library for React applications.

> It's a grid. Don't ask questions.

## Features

- 🚀 **AG Grid Compatible API** - Familiar interface for easy migration
- ⚛️ **React 19 Ready** - Built with the latest React features
- 📝 **TypeScript First** - Full type safety out of the box
- 🎨 **Shadcn UI Styled** - Beautiful, accessible components
- 📱 **Responsive** - Works on all screen sizes
- 🌙 **Dark Mode** - Automatic dark mode support
- 📖 **Storybook** - Interactive component documentation

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

See the [doc/](./doc) folder for detailed documentation:

- [Getting Started](./doc/getting-started.md)
- [API Reference](./doc/api-reference.md)
- [Column Definitions](./doc/column-definitions.md)
- [Examples](./doc/examples.md)

## Development with Codespaces

This project includes a devcontainer configuration for GitHub Codespaces with:

- Node.js 22
- Zsh with Oh My Zsh
- Starship prompt
- Pre-configured VS Code extensions

## License

GPL-3.0 - See [LICENSE](./LICENSE) for details.
