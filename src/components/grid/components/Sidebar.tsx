"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Columns3, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ColDef, FilterModel, TextFilterModel, NumberFilterModel, SideBarDef, ToolPanelDef } from "../types";
import { ColumnsPanel } from "./ColumnsPanel";
import { FiltersPanel } from "./FiltersPanel";

interface SidebarProps<TData> {
  sideBar: boolean | SideBarDef | string;
  columns: ColDef<TData>[];
  filterModel: FilterModel;
  onColumnVisibilityChange: (colId: string, visible: boolean) => void;
  onFilterChange: (colId: string, filter: TextFilterModel | NumberFilterModel | null) => void;
  onClearAllFilters: () => void;
  position?: "left" | "right";
  className?: string;
}

const defaultToolPanels: ToolPanelDef[] = [
  {
    id: "columns",
    labelDefault: "Columns",
    toolPanel: "agColumnsToolPanel",
    toolPanelParams: {
      suppressRowGroups: true,
      suppressValues: true,
      suppressPivots: true,
      suppressPivotMode: true,
    },
  },
  {
    id: "filters",
    labelDefault: "Filters",
    toolPanel: "agFiltersToolPanel",
  },
];

export function Sidebar<TData>({
  sideBar,
  columns,
  filterModel,
  onColumnVisibilityChange,
  onFilterChange,
  onClearAllFilters,
  position = "right",
  className,
}: SidebarProps<TData>) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activePanel, setActivePanel] = React.useState<string | null>(null);

  // Parse sidebar config
  const config = React.useMemo((): SideBarDef => {
    if (sideBar === true) {
      return { toolPanels: defaultToolPanels };
    }
    if (sideBar === false) {
      return { toolPanels: [] };
    }
    if (typeof sideBar === "string") {
      // Simple format: "columns" or "filters"
      return { toolPanels: [sideBar] };
    }
    return sideBar as SideBarDef;
  }, [sideBar]);

  const toolPanels = React.useMemo(() => {
    return (config.toolPanels || []).map((panel) => {
      if (typeof panel === "string") {
        // Map string to default tool panel
        return defaultToolPanels.find((p) => p.id === panel) || { id: panel, labelDefault: panel };
      }
      return panel;
    });
  }, [config.toolPanels]);

  // Set default active panel
  React.useEffect(() => {
    if (toolPanels.length > 0 && activePanel === null && !config.hiddenByDefault) {
      setActivePanel(config.defaultToolPanel || toolPanels[0].id);
    }
  }, [toolPanels, activePanel, config.defaultToolPanel, config.hiddenByDefault]);

  if (toolPanels.length === 0) {
    return null;
  }

  const getIcon = (panelId: string) => {
    switch (panelId) {
      case "columns":
        return <Columns3 className="h-4 w-4" />;
      case "filters":
        return <Filter className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const activeFilterCount = Object.keys(filterModel).length;
  const hiddenColumnCount = columns.filter((c) => c.hide).length;

  const renderPanel = () => {
    const panel = toolPanels.find((p) => p.id === activePanel);
    if (!panel) return null;

    if (panel.id === "columns" || panel.toolPanel === "agColumnsToolPanel") {
      return (
        <ColumnsPanel
          columns={columns}
          onColumnVisibilityChange={onColumnVisibilityChange}
          onClose={() => setActivePanel(null)}
          className="border-0 shadow-none rounded-none"
        />
      );
    }

    if (panel.id === "filters" || panel.toolPanel === "agFiltersToolPanel") {
      return (
        <FiltersPanel
          columns={columns}
          filterModel={filterModel}
          onFilterChange={onFilterChange}
          onClearAll={onClearAllFilters}
          onClose={() => setActivePanel(null)}
          className="border-0 shadow-none rounded-none"
          suppressExpandAll={panel.toolPanelParams?.suppressExpandAll}
          suppressFilterSearch={panel.toolPanelParams?.suppressFilterSearch}
        />
      );
    }

    // Custom panel
    if (typeof panel.toolPanel === "function") {
      const CustomPanel = panel.toolPanel as React.ComponentType<Record<string, unknown>>;
      return <CustomPanel {...(panel.toolPanelParams || {})} />;
    }

    return null;
  };

  return (
    <div
      className={cn(
        "flex border-l bg-background",
        position === "left" && "border-l-0 border-r",
        isCollapsed && "w-12",
        className
      )}
    >
      {/* Tab Bar */}
      <div className="flex flex-col border-r bg-muted/30">
        {toolPanels.map((panel) => {
          const isActive = activePanel === panel.id;
          const badge = panel.id === "filters" && activeFilterCount > 0
            ? activeFilterCount
            : panel.id === "columns" && hiddenColumnCount > 0
              ? hiddenColumnCount
              : null;

          return (
            <button
              key={panel.id}
              className={cn(
                "relative p-3 hover:bg-accent",
                isActive && "bg-accent border-l-2 border-primary"
              )}
              title={panel.labelDefault || panel.id}
              onClick={() => {
                if (isActive) {
                  setIsCollapsed(!isCollapsed);
                } else {
                  setActivePanel(panel.id);
                  setIsCollapsed(false);
                }
              }}
            >
              {getIcon(panel.id)}
              {badge !== null && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[10px] bg-primary text-primary-foreground rounded-full flex items-center justify-center px-1">
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Collapse Toggle */}
        <div className="mt-auto border-t">
          <button
            className="p-3 hover:bg-accent w-full"
            title={isCollapsed ? "Expand" : "Collapse"}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              position === "right" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              position === "right" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {!isCollapsed && activePanel && (
        <div className="w-64 overflow-hidden">
          {renderPanel()}
        </div>
      )}
    </div>
  );
}

