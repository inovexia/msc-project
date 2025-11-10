"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { Inbox, Users } from "lucide-react";

export type ViewMode = "inbox" | "client";

type ViewToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={viewMode === "inbox" ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "gap-2",
          viewMode === "inbox" && "bg-background shadow-sm"
        )}
        onClick={() => onViewModeChange("inbox")}
      >
        <Inbox className="h-4 w-4" />
        Inbox View
      </Button>
      <Button
        variant={viewMode === "client" ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "gap-2",
          viewMode === "client" && "bg-background shadow-sm"
        )}
        onClick={() => onViewModeChange("client")}
      >
        <Users className="h-4 w-4" />
        Client View
      </Button>
    </div>
  );
}
