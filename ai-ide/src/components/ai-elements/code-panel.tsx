"use client";

import { Copy, Eye, FileCode, Split, X } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ai-elements/code-block";
import type { MockFile } from "@/app/page";

function findFileByPath(
  path: string,
  files: MockFile[]
): MockFile | undefined {
  return files.find((f) => f.path === path);
}

interface CodePanelProps {
  files: MockFile[];
  currentFile: MockFile;
  selectedPath: string;
  setSelectedPath: (path: string) => void;
  openTabs: string[];
  setOpenTabs: (tabs: string[] | ((prev: string[]) => string[])) => void;
}

export function CodePanel({
  files,
  currentFile,
  selectedPath,
  setSelectedPath,
  openTabs,
  setOpenTabs,
}: CodePanelProps) {
  const handleCloseTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const filtered = openTabs.filter((t) => t !== path);
    setOpenTabs(filtered);
    if (selectedPath === path && filtered.length > 0) {
      setSelectedPath(filtered[filtered.length - 1]);
    }
  };

  return (
    <>
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-border/60 bg-muted/20 px-0">
        <div className="flex items-center overflow-x-auto min-w-0 scrollbar-none h-full">
          {openTabs.map((tabPath) => {
            const tabFile = findFileByPath(tabPath, files);
            const fileName = tabFile ? tabFile.name : tabPath;
            const isSelected = selectedPath === tabPath;
            return (
              <div
                key={tabPath}
                onClick={() => setSelectedPath(tabPath)}
                className={cn(
                  "group flex h-full items-center gap-2 px-3 text-xs font-mono cursor-pointer border-r border-border/40 transition-colors select-none",
                  isSelected
                    ? "bg-background text-foreground font-medium border-t-2 border-t-primary/70"
                    : "bg-muted/10 text-muted-foreground hover:bg-muted/30 hover:text-foreground border-t-2 border-t-transparent"
                )}
              >
                <FileCode className="size-3.5 text-muted-foreground group-hover:text-foreground" />
                <span className="truncate max-w-35 text-[11px]">{fileName}</span>
                <button
                  type="button"
                  onClick={(e) => handleCloseTab(e, tabPath)}
                  className="rounded p-0.5 text-muted-foreground/40 hover:bg-accent hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-2.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-0.5 px-2 shrink-0">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground"
                  onClick={() => toast.add({ title: "Split editor created" })}
                />
              }
            >
              <Split className="size-3" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Split Editor</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    toast.add({ title: "Preview mode enabled" })
                  }
                />
              }
            >
              <Eye className="size-3" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Preview Artifact</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(currentFile.content);
                    toast.add({ title: "Copied code to clipboard" });
                  }}
                />
              }
            >
              <Copy className="size-3" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Copy Code</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ContextMenu>
        <ContextMenuTrigger className="flex-1 overflow-auto bg-muted/5 outline-none">
          <CodeBlock
            className="rounded-none border-0 min-h-full"
            code={currentFile.content}
            language={currentFile.language}
            showLineNumbers
          />
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52 text-xs">
          <ContextMenuGroup>
            <ContextMenuLabel>File: {currentFile.name}</ContextMenuLabel>
            <ContextMenuItem
              onClick={() => toast.add({ title: "New File created" })}
            >
              New File
              <ContextMenuShortcut>Ctrl+N</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() =>
                toast.add({ title: "File Saved", description: selectedPath })
              }
            >
              Save
              <ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuItem
              onClick={() => toast.add({ title: "Undo performed" })}
            >
              Undo
              <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => toast.add({ title: "Redo performed" })}
            >
              Redo
              <ContextMenuShortcut>Ctrl+Y</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => toast.add({ title: "Cut to clipboard" })}
            >
              Cut
              <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                navigator.clipboard.writeText(currentFile.content);
                toast.add({ title: "Copied code" });
              }}
            >
              Copy
              <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => toast.add({ title: "Pasted" })}
            >
              Paste
              <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem
              variant="destructive"
              onClick={() =>
                toast.add({ title: "Delete file", description: "Action requested" })
              }
            >
              Delete
              <ContextMenuShortcut>Del</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
