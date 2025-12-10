"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {message}
      </div>
    </div>
  );
}

interface NoRowsOverlayProps {
  message?: string;
}

export function NoRowsOverlay({ message = "No rows to display" }: NoRowsOverlayProps) {
  return (
    <div className="flex items-center justify-center py-8 text-muted-foreground">
      {message}
    </div>
  );
}

