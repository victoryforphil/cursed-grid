"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ContextMenuItem, RowNode, ColDef, GridApi, ColumnApi } from "../types";

interface ContextMenuProps<TData> {
  items: (string | ContextMenuItem)[];
  position: { x: number; y: number };
  onClose: () => void;
  context: {
    node: RowNode<TData> | null;
    column: ColDef<TData> | null;
    value: unknown;
    api: GridApi<TData>;
    columnApi: ColumnApi<TData>;
  };
}

export function ContextMenu<TData>({
  items,
  position,
  onClose,
  context,
}: ContextMenuProps<TData>) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  React.useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${position.x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${position.y - rect.height}px`;
      }
    }
  }, [position]);

  const handleAction = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.action?.();
    onClose();
  };

  const renderItem = (item: string | ContextMenuItem, index: number) => {
    // Separator
    if (item === "separator") {
      return <div key={index} className="h-px bg-border my-1" />;
    }

    // Built-in items
    if (typeof item === "string") {
      const builtInItem = getBuiltInItem(item, context);
      if (!builtInItem) return null;
      return renderMenuItem(builtInItem, index);
    }

    return renderMenuItem(item, index);
  };

  const renderMenuItem = (item: ContextMenuItem, index: number) => {
    return (
      <button
        key={index}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent",
          item.disabled && "opacity-50 cursor-not-allowed",
          item.cssClasses?.join(" ")
        )}
        onClick={() => handleAction(item)}
        disabled={item.disabled}
      >
        {item.icon && <span className="w-4 h-4">{item.icon}</span>}
        <span className="flex-1">{item.name}</span>
        {item.shortcut && (
          <span className="text-xs text-muted-foreground">{item.shortcut}</span>
        )}
      </button>
    );
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[160px] bg-popover border rounded-md shadow-lg py-1"
      style={{ left: position.x, top: position.y }}
    >
      {items.map(renderItem)}
    </div>
  );
}

/**
 * Get built-in context menu item by name
 */
function getBuiltInItem<TData>(
  name: string,
  context: {
    node: RowNode<TData> | null;
    column: ColDef<TData> | null;
    value: unknown;
    api: GridApi<TData>;
    columnApi: ColumnApi<TData>;
  }
): ContextMenuItem | null {
  switch (name) {
    case "copy":
      return {
        name: "Copy",
        shortcut: "Ctrl+C",
        action: () => {
          const text = context.value != null ? String(context.value) : "";
          navigator.clipboard.writeText(text);
        },
      };

    case "copyWithHeaders":
      return {
        name: "Copy with Headers",
        action: () => {
          const header = context.column?.headerName || context.column?.field?.toString() || "";
          const value = context.value != null ? String(context.value) : "";
          navigator.clipboard.writeText(`${header}\n${value}`);
        },
      };

    case "copyWithGroupHeaders":
      return {
        name: "Copy with Group Headers",
        action: () => {
          const header = context.column?.headerName || context.column?.field?.toString() || "";
          const value = context.value != null ? String(context.value) : "";
          navigator.clipboard.writeText(`${header}\n${value}`);
        },
      };

    case "paste":
      return {
        name: "Paste",
        shortcut: "Ctrl+V",
        disabled: true, // Paste requires editable cells
        action: () => {
          // TODO: Implement paste for editable cells
        },
      };

    case "export":
      return {
        name: "Export",
        subMenu: [
          {
            name: "CSV Export",
            action: () => context.api.exportDataAsCsv(),
          },
        ],
      };

    case "csvExport":
      return {
        name: "CSV Export",
        action: () => context.api.exportDataAsCsv(),
      };

    case "excelExport":
      return {
        name: "Excel Export",
        disabled: true, // Excel export requires additional implementation
        action: () => {
          // TODO: Implement Excel export
        },
      };

    default:
      return null;
  }
}

/**
 * Default context menu items
 */
export const defaultContextMenuItems: (string | ContextMenuItem)[] = [
  "copy",
  "copyWithHeaders",
  "separator",
  "export",
];

