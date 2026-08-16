"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Columns2,
  Maximize2,
  Minimize2,
  Minus,
  SquareTerminal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Terminal, TerminalContent } from "@/components/ai-elements/terminal";
import { PanelOptionsMenu } from "@/components/ai-elements/panel-options-menu";

const mockTerminalLines = [
  "\u001B[32m✓\u001B[0m Building application...",
  "\u001B[36m  src/app.tsx\u001B[0m → \u001B[33mdist/app.js\u001B[0m",
  "\u001B[32m✓\u001B[0m Build completed in \u001B[33m1.2s\u001B[0m",
  "",
  "\u001B[34mRunning tests...\u001B[0m",
  "",
  " \u001B[32m✓\u001B[0m validateForm › returns errors for empty fields",
  " \u001B[32m✓\u001B[0m validateForm › returns error for invalid email",
  " \u001B[32mAll tests passed!\u001B[0m (5/5)",
];

export type TerminalDockMode = "artifact" | "chat" | "both";

interface TerminalPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onToggleCollapse: () => void;
  onClear: () => void;
  dockMode?: TerminalDockMode;
  onDockModeChange?: (mode: TerminalDockMode) => void;
  onCycleDockMode?: () => void;
}

// Visual icons representing the dock placements
const DockArtifactIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="size-3"
  >
    <rect
      x="1.5"
      y="2"
      width="13"
      height="12"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="14"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="8"
      y1="8.5"
      x2="14.5"
      y2="8.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <rect
      x="8.8"
      y="9.2"
      width="5"
      height="4.2"
      rx="0.5"
      fill="currentColor"
      opacity="0.55"
    />
  </svg>
);

const DockChatIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="size-3"
  >
    <rect
      x="1.5"
      y="2"
      width="13"
      height="12"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="14"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="1.5"
      y1="8.5"
      x2="8"
      y2="8.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <rect
      x="2.2"
      y="9.2"
      width="5"
      height="4.2"
      rx="0.5"
      fill="currentColor"
      opacity="0.55"
    />
  </svg>
);

const DockWideIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="size-3"
  >
    <rect
      x="1.5"
      y="2"
      width="13"
      height="12"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="8.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <line
      x1="1.5"
      y1="8.5"
      x2="14.5"
      y2="8.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <rect
      x="2.5"
      y="9.5"
      width="11"
      height="3.8"
      rx="0.5"
      fill="currentColor"
      opacity="0.55"
    />
  </svg>
);

export function TerminalPanel({
  activeTab,
  onTabChange,
  isMaximized,
  onToggleMaximize,
  onToggleCollapse,
  onClear,
  dockMode = "artifact",
  onDockModeChange,
  onCycleDockMode,
}: TerminalPanelProps) {
  const [output, setOutput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const isStarted = useRef(false);

  const streamTerminal = useCallback(async () => {
    setIsStreaming(true);
    let currentOutput = "";

    for (const line of mockTerminalLines) {
      currentOutput += `${line}\n`;
      setOutput(currentOutput);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    setIsStreaming(false);
  }, []);

  useEffect(() => {
    if (isStarted.current) return;
    isStarted.current = true;
    const timer = setTimeout(() => {
      streamTerminal();
    }, 100);
    return () => clearTimeout(timer);
  }, [streamTerminal]);

  const renderDockIcon = () => {
    if (dockMode === "both") return <DockWideIcon />;
    if (dockMode === "chat") return <DockChatIcon />;
    return <DockArtifactIcon />;
  };

  const getDockLabel = () => {
    if (dockMode === "both") return "Wide Span (Bottom)";
    if (dockMode === "chat") return "Docked under Chat";
    return "Docked under Editor";
  };

  return (
    <>
      <div className="flex h-7.5 shrink-0 items-center justify-between border-b border-border/50 bg-muted/25 px-2.5 text-xs gap-2 min-w-0">
        <div className="flex items-center gap-3 min-w-0 overflow-x-auto scrollbar-none">
          {["terminal", "output", "problems", "debug"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                "flex items-center gap-1.5 py-0.5 uppercase text-[11px] font-semibold tracking-wider transition-colors cursor-pointer shrink-0",
                activeTab === tab
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "terminal" && <SquareTerminal className="size-3" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {/* Dock Configuration Menu & Quick Cycle Button */}
          {onDockModeChange && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
                        >
                          {renderDockIcon()}
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent side="top">
                  Layout: {getDockLabel()} (Click to change)
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent align="end" className="w-56 text-xs">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                    Terminal Dock Position
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDockModeChange("artifact")}
                    className={cn(
                      "flex items-center justify-between cursor-pointer",
                      dockMode === "artifact" && "font-semibold text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <DockArtifactIcon />
                      <span>Under Editor (Artifact)</span>
                    </div>
                    {dockMode === "artifact" && <span className="text-primary text-[10px]">●</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDockModeChange("chat")}
                    className={cn(
                      "flex items-center justify-between cursor-pointer",
                      dockMode === "chat" && "font-semibold text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <DockChatIcon />
                      <span>Under Chat</span>
                    </div>
                    {dockMode === "chat" && <span className="text-primary text-[10px]">●</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDockModeChange("both")}
                    className={cn(
                      "flex items-center justify-between cursor-pointer",
                      dockMode === "both" && "font-semibold text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <DockWideIcon />
                      <span>Wide Span (Full Bottom)</span>
                    </div>
                    {dockMode === "both" && <span className="text-primary text-[10px]">●</span>}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Quick cycle button if onCycleDockMode is provided */}
          {!onDockModeChange && onCycleDockMode && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 text-muted-foreground hover:text-foreground"
                    onClick={onCycleDockMode}
                  >
                    {renderDockIcon()}
                  </Button>
                }
              />
              <TooltipContent side="top">
                Change Dock Position (Current: {getDockLabel()})
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setOutput("");
                    onClear();
                  }}
                >
                  <Trash2 className="size-3" />
                </Button>
              }
            >
              Clear Terminal
            </TooltipTrigger>
            <TooltipContent side="top">Clear Console</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:text-foreground"
                  onClick={onToggleMaximize}
                >
                  {isMaximized ? (
                    <Minimize2 className="size-3" />
                  ) : (
                    <Maximize2 className="size-3" />
                  )}
                </Button>
              }
            >
              {isMaximized ? "Restore Size" : "Maximize Panel"}
            </TooltipTrigger>
            <TooltipContent side="top">
              {isMaximized ? "Restore" : "Maximize"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-muted-foreground hover:text-foreground"
                  onClick={onToggleCollapse}
                >
                  <Minus className="size-3" />
                </Button>
              }
            >
              Collapse Panel
            </TooltipTrigger>
            <TooltipContent side="top">Collapse Panel</TooltipContent>
          </Tooltip>
          <PanelOptionsMenu className="size-5" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background/95">
        <Terminal
          className="h-full rounded-none border-0"
          isStreaming={isStreaming}
          output={output}
        >
          <TerminalContent className="max-h-full overflow-y-auto font-mono text-xs" />
        </Terminal>
      </div>
    </>
  );
}
