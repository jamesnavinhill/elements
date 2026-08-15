"use client";

import { useState } from "react";
import {
  FilePlus,
  FolderPlus,
  ChevronLeft,
  Search,
  GitBranch,
  Blocks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "@/components/ui/toast";
import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@/components/ai-elements/file-tree";

interface ExplorerPanelProps {
  activeTab?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ExplorerPanel({
  activeTab = "explorer",
  isCollapsed,
  onToggleCollapse,
}: ExplorerPanelProps) {
  const [selectedPath, setSelectedPath] = useState<string>("src/app.tsx");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["src", "src/components", "src/utils"])
  );

  const renderContent = () => {
    switch (activeTab) {
      case "search":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-muted-foreground">
            <Search className="size-5 text-muted-foreground/60" />
            <p>Search across files</p>
          </div>
        );
      case "git":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-muted-foreground">
            <GitBranch className="size-5 text-muted-foreground/60" />
            <p>Source control</p>
          </div>
        );
      case "extensions":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-muted-foreground">
            <Blocks className="size-5 text-muted-foreground/60" />
            <p>Extensions</p>
          </div>
        );
      default:
        return (
          <ContextMenu>
            <ContextMenuTrigger className="flex-1 overflow-auto p-1 outline-none">
              <FileTree
                className="border-none bg-transparent p-0"
                expanded={expandedPaths}
                onExpandedChange={setExpandedPaths}
                onSelect={setSelectedPath}
                selectedPath={selectedPath}
              >
                <FileTreeFolder name="src" path="src">
                  <FileTreeFolder name="components" path="src/components">
                    <FileTreeFile
                      name="button.tsx"
                      path="src/components/button.tsx"
                    />
                    <FileTreeFile
                      name="input.tsx"
                      path="src/components/input.tsx"
                    />
                  </FileTreeFolder>
                  <FileTreeFolder name="utils" path="src/utils">
                    <FileTreeFile
                      name="helpers.ts"
                      path="src/utils/helpers.ts"
                    />
                  </FileTreeFolder>
                  <FileTreeFile name="app.tsx" path="src/app.tsx" />
                </FileTreeFolder>
                <FileTreeFile name="package.json" path="package.json" />
                <FileTreeFile name="README.md" path="README.md" />
              </FileTree>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 text-xs">
              <ContextMenuGroup>
                <ContextMenuLabel>Explorer</ContextMenuLabel>
                <ContextMenuItem
                  onClick={() => toast.add({ title: "New File created" })}
                >
                  New File
                  <ContextMenuShortcut>Ctrl+N</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => toast.add({ title: "New Folder created" })}
                >
                  New Folder
                  <ContextMenuShortcut>Ctrl+Shift+N</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuGroup>
                <ContextMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPath);
                    toast.add({
                      title: "Path copied",
                      description: selectedPath,
                    });
                  }}
                >
                  Copy Path
                  <ContextMenuShortcut>Ctrl+Alt+C</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => toast.add({ title: "File refreshed" })}
                >
                  Reveal in Explorer
                </ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuContent>
          </ContextMenu>
        );
    }
  };

  return (
    <>
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-border/50 px-2.5 bg-muted/20">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          {activeTab === "explorer" && "Explorer"}
          {activeTab === "search" && "Search"}
          {activeTab === "git" && "Source Control"}
          {activeTab === "extensions" && "Extensions"}
        </span>
        <div className="flex items-center gap-0.5">
          {activeTab === "explorer" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 text-muted-foreground hover:text-foreground"
                title="New File"
                onClick={() =>
                  toast.add({
                    title: "New File",
                    description: "Enter file name in explorer",
                  })
                }
              >
                <FilePlus className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 text-muted-foreground hover:text-foreground"
                title="New Folder"
                onClick={() =>
                  toast.add({
                    title: "New Folder",
                    description: "Enter directory name",
                  })
                }
              >
                <FolderPlus className="size-3" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-5 text-muted-foreground hover:text-foreground"
            title={isCollapsed ? "Expand Explorer" : "Collapse Explorer"}
            onClick={onToggleCollapse}
          >
            <ChevronLeft
              className={cn(
                "size-3 transition-transform",
                isCollapsed && "-rotate-180"
              )}
            />
          </Button>
        </div>
      </div>

      {renderContent()}
    </>
  );
}
