"use client";

import { useState, useEffect, useCallback } from "react";
import { Maximize2, Minimize2, Minus, SquareTerminal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Terminal, TerminalContent } from "@/components/ai-elements/terminal";

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

interface TerminalPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onToggleCollapse: () => void;
  onClear: () => void;
}

export function TerminalPanel({
  activeTab,
  onTabChange,
  isMaximized,
  onToggleMaximize,
  onToggleCollapse,
  onClear,
}: TerminalPanelProps) {
  const [output, setOutput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  const streamTerminal = useCallback(async () => {
    setIsStreaming(true);
    let currentOutput = "";

    for (const line of mockTerminalLines) {
      currentOutput += `${line}\n`;
      setOutput(currentOutput);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    setIsStreaming(false);
  }, []);

  useEffect(() => {
    streamTerminal();
  }, [streamTerminal]);

  return (
    <>
      <div className="flex h-7.5 shrink-0 items-center justify-between border-b border-border/50 bg-muted/25 px-2.5 text-xs">
        <div className="flex items-center gap-4">
          {["terminal", "output", "problems", "debug"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                "flex items-center gap-1.5 py-0.5 uppercase text-[11px] font-semibold tracking-wider transition-colors cursor-pointer",
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

        <div className="flex items-center gap-1">
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
