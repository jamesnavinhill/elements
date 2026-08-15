"use client";

import { type GroupImperativeHandle } from "react-resizable-panels";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import type { MockFile } from "@/app/page";

import { ExplorerPanel } from "@/components/ai-elements/explorer-panel";
import { ChatPanel } from "@/components/ai-elements/chat-panel";
import { CodePanel } from "@/components/ai-elements/code-panel";
import { TerminalPanel } from "@/components/ai-elements/terminal-panel";

interface WorkspaceLayoutProps {
  activeActivityTab: string;
  files: MockFile[];
  currentFile: MockFile;
  selectedPath: string;
  setSelectedPath: (path: string) => void;
  openTabs: string[];
  setOpenTabs: (tabs: string[] | ((prev: string[]) => string[])) => void;
  outerGroupRef: React.RefObject<GroupImperativeHandle | null>;
  leftInnerGroupRef: React.RefObject<GroupImperativeHandle | null>;
  rightInnerGroupRef: React.RefObject<GroupImperativeHandle | null>;
  isExplorerOpen: boolean;
  isChatPanelOpen: boolean;
  isRightPanelOpen: boolean;
  isTerminalOpen: boolean;
  onToggleExplorer: () => void;
}

const LEFT_GROUP_DEFAULT = 50;
const EXPLORER_DEFAULT = 25;
const CHAT_DEFAULT = 75;
const RIGHT_GROUP_DEFAULT = 50;
const CODE_DEFAULT = 65;
const TERMINAL_DEFAULT = 35;

export function WorkspaceLayout({
  activeActivityTab,
  files,
  currentFile,
  selectedPath,
  setSelectedPath,
  openTabs,
  setOpenTabs,
  outerGroupRef,
  leftInnerGroupRef,
  rightInnerGroupRef,
  isExplorerOpen,
  isChatPanelOpen,
  isRightPanelOpen,
  isTerminalOpen,
  onToggleExplorer,
}: WorkspaceLayoutProps) {
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [activeTerminalTab, setActiveTerminalTab] = useState("terminal");

  const setSelectedPathStable = setSelectedPath;

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      groupRef={outerGroupRef}
      className="h-full w-full"
    >
      {/* Left group: Explorer + Chat split 25/75 */}
      <ResizablePanel
        defaultSize={LEFT_GROUP_DEFAULT}
        minSize={0}
        id="left-group"
        className={cn(
          "flex flex-col overflow-hidden min-w-0",
          (isExplorerOpen || isChatPanelOpen) && "bg-card/15"
        )}
      >
        <ResizablePanelGroup
          orientation="horizontal"
          groupRef={leftInnerGroupRef}
          className="h-full w-full"
        >
          <ResizablePanel
            defaultSize={EXPLORER_DEFAULT}
            minSize={0}
            id="explorer"
            className="flex flex-col border-r border-border/60 bg-card/30 overflow-hidden min-w-0"
          >
            <ExplorerPanel
              activeTab={activeActivityTab}
              isCollapsed={!isExplorerOpen}
              onToggleCollapse={onToggleExplorer}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={CHAT_DEFAULT}
            minSize={0}
            id="chat"
            className="flex flex-col overflow-hidden border-r border-border/60 bg-card/10 min-w-0"
          >
            <ChatPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right group: Code + Terminal */}
      <ResizablePanel
        defaultSize={RIGHT_GROUP_DEFAULT}
        minSize={0}
        id="right-group"
        className="flex flex-col overflow-hidden min-w-0"
      >
        <ResizablePanelGroup
          orientation="vertical"
          groupRef={rightInnerGroupRef}
          className="h-full w-full"
        >
          <ResizablePanel
            defaultSize={isTerminalOpen ? CODE_DEFAULT : 100}
            minSize={15}
            id="code"
            className="flex flex-col overflow-hidden min-h-0 bg-background"
          >
            <CodePanel
              files={files}
              currentFile={currentFile}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPathStable}
              openTabs={openTabs}
              setOpenTabs={setOpenTabs}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={TERMINAL_DEFAULT}
            minSize={0}
            id="terminal"
            onResize={(size) => setIsTerminalMaximized(size.asPercentage > 90)}
            className="flex flex-col overflow-hidden min-h-0 bg-background border-t border-border/60"
          >
            <TerminalPanel
              activeTab={activeTerminalTab}
              onTabChange={setActiveTerminalTab}
              isMaximized={isTerminalMaximized}
              onToggleMaximize={() => {
                const group = rightInnerGroupRef.current;
                if (!group) return;
                group.setLayout({
                  code: isTerminalMaximized ? CODE_DEFAULT : 20,
                  terminal: isTerminalMaximized ? TERMINAL_DEFAULT : 80,
                });
              }}
              onToggleCollapse={() => {
                const group = rightInnerGroupRef.current;
                if (!group) return;
                group.setLayout({
                  code: 100,
                  terminal: 0,
                });
              }}
              onClear={() => {
                toast.add({ title: "Terminal cleared" });
              }}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
