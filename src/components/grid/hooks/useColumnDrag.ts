/**
 * Column Drag Hook
 * Handles drag-and-drop column reordering
 */

import * as React from "react";

export interface ColumnDragState {
  draggedColId: string | null;
  dragOverColId: string | null;
}

export function useColumnDrag(onColumnMove?: (colId: string, toIndex: number) => void) {
  const [dragState, setDragState] = React.useState<ColumnDragState>({
    draggedColId: null,
    dragOverColId: null,
  });

  const handleDragStart = React.useCallback((colId: string) => {
    setDragState((prev) => ({ ...prev, draggedColId: colId }));
  }, []);

  const handleDragOver = React.useCallback((colId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragState((prev) => ({ ...prev, dragOverColId: colId }));
  }, []);

  const handleDragEnd = React.useCallback(() => {
    setDragState({ draggedColId: null, dragOverColId: null });
  }, []);

  const handleDrop = React.useCallback(
    (targetColId: string, columns: { colId: string }[]) => {
      const { draggedColId } = dragState;
      
      if (!draggedColId || draggedColId === targetColId) {
        setDragState({ draggedColId: null, dragOverColId: null });
        return;
      }

      const toIndex = columns.findIndex((col) => col.colId === targetColId);
      
      if (toIndex !== -1 && onColumnMove) {
        onColumnMove(draggedColId, toIndex);
      }
      
      setDragState({ draggedColId: null, dragOverColId: null });
    },
    [dragState, onColumnMove]
  );

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
  };
}

