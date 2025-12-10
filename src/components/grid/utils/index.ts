/**
 * Grid utility functions
 */

import type { RowNode, ColDef, TextFilterModel, NumberFilterModel, SetFilterModel } from "../types";

/**
 * Get value from row data using field path (supports nested paths like "user.name")
 */
export function getFieldValue<TData>(data: TData, field: string): unknown {
  if (!field) return undefined;
  
  const parts = field.split(".");
  let value: unknown = data;
  
  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  
  return value;
}

/**
 * Generate a unique row ID
 */
export function generateRowId<TData>(
  data: TData,
  index: number,
  getRowId?: (params: { data: TData }) => string
): string {
  if (getRowId) {
    return getRowId({ data });
  }
  return `row-${index}`;
}

/**
 * Create row nodes from row data
 */
export function createRowNodes<TData>(
  rowData: TData[],
  getRowId?: (params: { data: TData }) => string,
  startIndex: number = 0
): RowNode<TData>[] {
  return rowData.map((data, index) => ({
    id: generateRowId(data, startIndex + index, getRowId),
    data,
    rowIndex: startIndex + index,
    isSelected: false,
  }));
}

/**
 * Default comparator for sorting
 */
export function defaultComparator(valueA: unknown, valueB: unknown): number {
  if (valueA === valueB) return 0;
  if (valueA === null || valueA === undefined) return 1;
  if (valueB === null || valueB === undefined) return -1;
  
  if (typeof valueA === "number" && typeof valueB === "number") {
    return valueA - valueB;
  }
  
  return String(valueA).localeCompare(String(valueB));
}

/**
 * Apply text filter to a value
 */
export function applyTextFilter(value: unknown, filter: TextFilterModel): boolean {
  if (!filter.filter && filter.type !== "blank" && filter.type !== "notBlank") {
    return true;
  }

  const strValue = String(value ?? "").toLowerCase();
  const filterValue = (filter.filter ?? "").toLowerCase();

  switch (filter.type) {
    case "contains":
      return strValue.includes(filterValue);
    case "notContains":
      return !strValue.includes(filterValue);
    case "equals":
      return strValue === filterValue;
    case "notEqual":
      return strValue !== filterValue;
    case "startsWith":
      return strValue.startsWith(filterValue);
    case "endsWith":
      return strValue.endsWith(filterValue);
    case "blank":
      return !value || strValue === "";
    case "notBlank":
      return !!value && strValue !== "";
    default:
      return true;
  }
}

/**
 * Apply number filter to a value
 */
export function applyNumberFilter(value: unknown, filter: NumberFilterModel): boolean {
  const numValue = Number(value);
  
  if (filter.type === "blank") {
    return value === null || value === undefined || value === "";
  }
  if (filter.type === "notBlank") {
    return value !== null && value !== undefined && value !== "";
  }
  
  if (isNaN(numValue) || filter.filter === undefined) {
    return true;
  }

  switch (filter.type) {
    case "equals":
      return numValue === filter.filter;
    case "notEqual":
      return numValue !== filter.filter;
    case "greaterThan":
      return numValue > filter.filter;
    case "greaterThanOrEqual":
      return numValue >= filter.filter;
    case "lessThan":
      return numValue < filter.filter;
    case "lessThanOrEqual":
      return numValue <= filter.filter;
    case "inRange":
      return numValue >= filter.filter && numValue <= (filter.filterTo ?? filter.filter);
    default:
      return true;
  }
}

/**
 * Apply set filter to a value
 */
export function applySetFilter(value: unknown, filter: SetFilterModel): boolean {
  // Empty selection means show nothing (AG Grid behavior)
  if (filter.values.length === 0) {
    return false;
  }
  
  // Check if value is in the selected set
  const strValue = value === null || value === undefined ? null : String(value);
  return filter.values.includes(strValue);
}

/**
 * Check if a filter model entry passes for a given value
 */
export function passesFilter(value: unknown, filterEntry: unknown): boolean {
  if (!filterEntry || typeof filterEntry !== "object") {
    // Simple string filter (quick filter style)
    if (typeof filterEntry === "string") {
      return String(value ?? "").toLowerCase().includes(filterEntry.toLowerCase());
    }
    return true;
  }

  const filter = filterEntry as { filterType?: string };
  
  if (filter.filterType === "text") {
    return applyTextFilter(value, filter as TextFilterModel);
  }
  if (filter.filterType === "number") {
    return applyNumberFilter(value, filter as NumberFilterModel);
  }
  if (filter.filterType === "set") {
    return applySetFilter(value, filter as SetFilterModel);
  }
  
  // Default: simple contains filter
  if ("filter" in filter && typeof (filter as { filter?: string }).filter === "string") {
    return String(value ?? "").toLowerCase().includes(
      ((filter as { filter: string }).filter).toLowerCase()
    );
  }
  
  return true;
}

/**
 * Get the column ID from a column definition
 */
export function getColId<TData>(colDef: ColDef<TData>, index?: number): string {
  return colDef.colId || colDef.field?.toString() || `col-${index ?? 0}`;
}

/**
 * Get cell value using valueGetter or field
 */
export function getCellValue<TData>(
  node: RowNode<TData>,
  colDef: ColDef<TData>
): unknown {
  if (colDef.valueGetter) {
    return colDef.valueGetter({
      data: node.data,
      colDef,
      node,
      colId: getColId(colDef),
    });
  }
  
  if (colDef.field) {
    return getFieldValue(node.data, colDef.field.toString());
  }
  
  return undefined;
}

/**
 * Format cell value using valueFormatter or default string conversion
 */
export function formatCellValue<TData>(
  node: RowNode<TData>,
  colDef: ColDef<TData>,
  value: unknown
): string {
  if (colDef.valueFormatter) {
    return colDef.valueFormatter({
      value,
      data: node.data,
      colDef,
      node,
      colId: getColId(colDef),
    });
  }
  
  if (value === null || value === undefined) {
    return "";
  }
  
  return String(value);
}

