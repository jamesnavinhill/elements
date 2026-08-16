"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Plus,
  Copy,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface PanelOptionsMenuProps {
  className?: string;
  align?: "start" | "center" | "end";
  onClose?: () => void;
}

export function PanelOptionsMenu({
  className,
  align = "end",
  onClose,
}: PanelOptionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-6 rounded p-0 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer",
              className
            )}
            title="Panel Options"
          >
            <MoreVertical className="size-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align={align} className="w-48 text-xs">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              toast.add({
                title: "New Action Created",
                description: "Action performed from panel menu",
              })
            }
          >
            <Plus className="size-3.5 mr-2 text-muted-foreground" />
            New Action
            <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              toast.add({
                title: "Copied to Clipboard",
                description: "Panel content reference copied",
              });
            }}
          >
            <Copy className="size-3.5 mr-2 text-muted-foreground" />
            Copy View
            <DropdownMenuShortcut>Ctrl+C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              toast.add({
                title: "Panel Refreshed",
                description: "View synchronized",
              })
            }
          >
            <RotateCcw className="size-3.5 mr-2 text-muted-foreground" />
            Refresh
            <DropdownMenuShortcut>Ctrl+R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              toast.add({
                title: "View Options Opened",
                description: "Configuring panel display",
              })
            }
          >
            <SlidersHorizontal className="size-3.5 mr-2 text-muted-foreground" />
            View Options
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                toast.add({
                  title: "Clear / Reset",
                  description: "Panel state reset",
                });
              }
            }}
          >
            <Trash2 className="size-3.5 mr-2" />
            Clear
            <DropdownMenuShortcut>Del</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
