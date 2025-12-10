"use client";

import * as React from "react";

interface GridPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRowCount: number;
  filteredCount?: number;
  originalCount?: number;
  onPageChange: (page: number) => void;
}

export function GridPagination({
  currentPage,
  totalPages,
  totalRowCount,
  filteredCount,
  originalCount,
  onPageChange,
}: GridPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-muted-foreground">
        Page {currentPage + 1} of {totalPages}
        {totalRowCount > 0 && ` (${totalRowCount} total rows)`}
        {filteredCount !== undefined && originalCount !== undefined && filteredCount !== originalCount && (
          <span className="ml-1">
            ({filteredCount} of {originalCount} filtered)
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 text-sm border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <button
          className="px-3 py-1 text-sm border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

