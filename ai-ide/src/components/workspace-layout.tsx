"use client";

import { useState, useRef } from "react";
import {
  type GroupImperativeHandle,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { MockFile } from "@/app/page";

import { ExplorerPanel } from "@/components/ai-elements/explorer-panel";
import { ChatPanel } from "@/components/ai-elements/chat-panel";
import { CodePanel } from "@/components/ai-elements/code-panel";
import { TerminalPanel } from "@/components/ai-elements/terminal-panel";

export type PanelId = "explorer" | "chat" | "artifact" | "terminal";
export type TerminalDockMode = "artifact" | "chat" | "both";

interface WorkspaceLayoutProps {
  activeActivityTab: string;
  files: MockFile[];
  currentFile: MockFile;
  selectedPath: string;
  setSelectedPath: (path: string) => void;
  openTabs: string[];
  setOpenTabs: (tabs: string[] | ((prev: string[]) => string[])) => void;
  openState: Record<PanelId, boolean>;
  onOpenStateChange: (panel: PanelId, isOpen: boolean) => void;
  explorerPanelRef: React.RefObject<PanelImperativeHandle | null>;
  chatPanelRef: React.RefObject<PanelImperativeHandle | null>;
  codePanelRef: React.RefObject<PanelImperativeHandle | null>;
  terminalPanelRef: React.RefObject<PanelImperativeHandle | null>;
  outerGroupRef: React.RefObject<GroupImperativeHandle | null>;
  onToggleExplorer: () => void;
  onToggleChat: () => void;
  onToggleArtifact: () => void;
  onToggleTerminal: () => void;
  terminalDockMode?: TerminalDockMode;
  onTerminalDockModeChange?: (mode: TerminalDockMode) => void;
}

export function WorkspaceLayout({
  activeActivityTab,
  files,
  currentFile,
  selectedPath,
  setSelectedPath,
  openTabs,
  setOpenTabs,
  openState,
  onOpenStateChange,
  explorerPanelRef,
  chatPanelRef,
  codePanelRef,
  terminalPanelRef,
  outerGroupRef,
  onToggleTerminal,
  terminalDockMode: controlledDockMode,
  onTerminalDockModeChange,
}: WorkspaceLayoutProps) {
  const [internalDockMode, setInternalDockMode] = useState<TerminalDockMode>("artifact");
  const dockMode = controlledDockMode ?? internalDockMode;

  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [activeTerminalTab, setActiveTerminalTab] = useState("terminal");

  const workspaceVerticalGroupRef = useRef<GroupImperativeHandle | null>(null);
  const workspaceHorizontalGroupRef = useRef<GroupImperativeHandle | null>(null);

  const handleDockModeChange = (nextMode: TerminalDockMode) => {
    if (onTerminalDockModeChange) {
      onTerminalDockModeChange(nextMode);
    } else {
      setInternalDockMode(nextMode);
    }

    const labels: Record<TerminalDockMode, string> = {
      artifact: "Docked under Editor / Artifact",
      chat: "Docked under Chat",
      both: "Wide Span across Chat & Editor",
    };

    toast.add({
      title: "Terminal Layout Changed",
      description: labels[nextMode],
    });
  };

  const handleCycleDockMode = () => {
    const cycleMap: Record<TerminalDockMode, TerminalDockMode> = {
      artifact: "both",
      both: "chat",
      chat: "artifact",
    };
    handleDockModeChange(cycleMap[dockMode]);
  };

  const handleToggleMaximizeTerminal = () => {
    const group = workspaceVerticalGroupRef.current;
    if (!group) return;

    if (isTerminalMaximized) {
      if (dockMode === "both") {
        group.setLayout({ "top-row": 68, terminal: 32 });
      } else if (dockMode === "artifact") {
        group.setLayout({ artifact: 68, terminal: 32 });
      } else {
        group.setLayout({ chat: 68, terminal: 32 });
      }
      setIsTerminalMaximized(false);
    } else {
      if (dockMode === "both") {
        group.setLayout({ "top-row": 15, terminal: 85 });
      } else if (dockMode === "artifact") {
        group.setLayout({ artifact: 15, terminal: 85 });
      } else {
        group.setLayout({ chat: 15, terminal: 85 });
      }
      setIsTerminalMaximized(true);
    }
  };

  // Shared Terminal Panel Component
  const renderTerminal = () => (
    <TerminalPanel
      activeTab={activeTerminalTab}
      onTabChange={setActiveTerminalTab}
      isMaximized={isTerminalMaximized}
      dockMode={dockMode}
      onDockModeChange={handleDockModeChange}
      onCycleDockMode={handleCycleDockMode}
      onToggleMaximize={handleToggleMaximizeTerminal}
      onToggleCollapse={onToggleTerminal}
      onClear={() => {
        toast.add({ title: "Terminal cleared" });
      }}
    />
  );

  // Shared Code/Artifact Panel Component
  const renderCodePanel = () => (
    <CodePanel
      files={files}
      currentFile={currentFile}
      selectedPath={selectedPath}
      setSelectedPath={setSelectedPath}
      openTabs={openTabs}
      setOpenTabs={setOpenTabs}
    />
  );

  // Shared Chat Panel Component
  const renderChatPanel = () => <ChatPanel />;

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      groupRef={outerGroupRef}
      className="h-full w-full"
      id="main-app-outer-group"
    >
      {/* 1. Full Vertical Explorer Panel */}
      <ResizablePanel
        id="explorer"
        panelRef={explorerPanelRef}
        defaultSize="18%"
        minSize="12%"
        maxSize="45%"
        collapsible
        onResize={(size) => {
          const isOpen = size.asPercentage > 1;
          if (isOpen !== openState.explorer) {
            onOpenStateChange("explorer", isOpen);
          }
        }}
        className="flex flex-col border-r border-border/60 bg-card/30 overflow-hidden min-w-0"
      >
        <ExplorerPanel activeTab={activeActivityTab} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* 2. Isolated Workspace Container */}
      <ResizablePanel
        id="workspace-container"
        defaultSize="82%"
        minSize="30%"
        className="flex flex-col overflow-hidden min-w-0 min-h-0 bg-background"
      >
        {/* Dock Mode A: Wide bottom terminal across Chat & Artifact */}
        {dockMode === "both" && (
          openState.terminal ? (
            <ResizablePanelGroup
              key="workspace-dock-both-open"
              orientation="vertical"
              groupRef={workspaceVerticalGroupRef}
              className="h-full w-full"
              id="workspace-vertical-group-both"
            >
              <ResizablePanel
                id="top-row"
                defaultSize="68%"
                minSize="20%"
                className="flex flex-col overflow-hidden min-h-0 min-w-0"
              >
                <ResizablePanelGroup
                  orientation="horizontal"
                  groupRef={workspaceHorizontalGroupRef}
                  className="h-full w-full"
                  id="workspace-horizontal-both"
                >
                  <ResizablePanel
                    id="chat"
                    panelRef={chatPanelRef}
                    defaultSize="38%"
                    minSize="15%"
                    collapsible
                    onResize={(size) => {
                      const isOpen = size.asPercentage > 1;
                      if (isOpen !== openState.chat) onOpenStateChange("chat", isOpen);
                    }}
                    className={cn(
                      "flex flex-col overflow-hidden bg-card/10 min-w-0",
                      openState.chat && "border-r border-border/60"
                    )}
                  >
                    {renderChatPanel()}
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel
                    id="artifact"
                    panelRef={codePanelRef}
                    defaultSize="62%"
                    minSize="20%"
                    collapsible
                    onResize={(size) => {
                      const isOpen = size.asPercentage > 1;
                      if (isOpen !== openState.artifact) onOpenStateChange("artifact", isOpen);
                    }}
                    className="flex flex-col overflow-hidden min-w-0"
                  >
                    {renderCodePanel()}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel
                id="terminal"
                panelRef={terminalPanelRef}
                defaultSize="32%"
                minSize="10%"
                collapsible
                onResize={(size) => {
                  const isOpen = size.asPercentage > 1;
                  if (isOpen !== openState.terminal) onOpenStateChange("terminal", isOpen);
                  setIsTerminalMaximized(size.asPercentage > 80);
                }}
                className="flex flex-col overflow-hidden min-h-0 bg-background border-t border-border/60"
              >
                {renderTerminal()}
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <ResizablePanelGroup
              key="workspace-dock-both-closed"
              orientation="horizontal"
              groupRef={workspaceHorizontalGroupRef}
              className="h-full w-full"
              id="workspace-horizontal-both-noterminal"
            >
              <ResizablePanel
                id="chat"
                panelRef={chatPanelRef}
                defaultSize="38%"
                minSize="15%"
                collapsible
                onResize={(size) => {
                  const isOpen = size.asPercentage > 1;
                  if (isOpen !== openState.chat) onOpenStateChange("chat", isOpen);
                }}
                className={cn(
                  "flex flex-col overflow-hidden bg-card/10 min-w-0",
                  openState.chat && "border-r border-border/60"
                )}
              >
                {renderChatPanel()}
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel
                id="artifact"
                panelRef={codePanelRef}
                defaultSize="62%"
                minSize="20%"
                collapsible
                onResize={(size) => {
                  const isOpen = size.asPercentage > 1;
                  if (isOpen !== openState.artifact) onOpenStateChange("artifact", isOpen);
                }}
                className="flex flex-col overflow-hidden min-w-0"
              >
                {renderCodePanel()}
              </ResizablePanel>
            </ResizablePanelGroup>
          )
        )}

        {/* Dock Mode B: Terminal docked under Artifact only (Default) */}
        {dockMode === "artifact" && (
          <ResizablePanelGroup
            key="workspace-dock-artifact"
            orientation="horizontal"
            groupRef={workspaceHorizontalGroupRef}
            className="h-full w-full"
            id="workspace-horizontal-artifact"
          >
            <ResizablePanel
              id="chat"
              panelRef={chatPanelRef}
              defaultSize="38%"
              minSize="15%"
              collapsible
              onResize={(size) => {
                const isOpen = size.asPercentage > 1;
                if (isOpen !== openState.chat) onOpenStateChange("chat", isOpen);
              }}
              className={cn(
                "flex flex-col overflow-hidden bg-card/10 min-w-0",
                openState.chat && "border-r border-border/60"
              )}
            >
              {renderChatPanel()}
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
              id="artifact-column"
              panelRef={codePanelRef}
              defaultSize="62%"
              minSize="20%"
              collapsible
              onResize={(size) => {
                const isOpen = size.asPercentage > 1;
                if (isOpen !== openState.artifact) onOpenStateChange("artifact", isOpen);
              }}
              className="flex flex-col overflow-hidden min-w-0 min-h-0"
            >
              {openState.terminal ? (
                <ResizablePanelGroup
                  key="artifact-vertical-open"
                  orientation="vertical"
                  groupRef={workspaceVerticalGroupRef}
                  className="h-full w-full"
                  id="workspace-vertical-artifact"
                >
                  <ResizablePanel
                    id="artifact"
                    defaultSize="68%"
                    minSize="20%"
                    className="flex flex-col overflow-hidden min-h-0 bg-background"
                  >
                    {renderCodePanel()}
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel
                    id="terminal"
                    panelRef={terminalPanelRef}
                    defaultSize="32%"
                    minSize="10%"
                    collapsible
                    onResize={(size) => {
                      const isOpen = size.asPercentage > 1;
                      if (isOpen !== openState.terminal) onOpenStateChange("terminal", isOpen);
                      setIsTerminalMaximized(size.asPercentage > 80);
                    }}
                    className="flex flex-col overflow-hidden min-h-0 bg-background border-t border-border/60"
                  >
                    {renderTerminal()}
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                renderCodePanel()
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {/* Dock Mode C: Terminal docked under Chat only */}
        {dockMode === "chat" && (
          <ResizablePanelGroup
            key="workspace-dock-chat"
            orientation="horizontal"
            groupRef={workspaceHorizontalGroupRef}
            className="h-full w-full"
            id="workspace-horizontal-chat"
          >
            <ResizablePanel
              id="chat-column"
              panelRef={chatPanelRef}
              defaultSize="38%"
              minSize="15%"
              collapsible
              onResize={(size) => {
                const isOpen = size.asPercentage > 1;
                if (isOpen !== openState.chat) onOpenStateChange("chat", isOpen);
              }}
              className="flex flex-col overflow-hidden min-w-0 min-h-0 border-r border-border/60"
            >
              {openState.terminal ? (
                <ResizablePanelGroup
                  key="chat-vertical-open"
                  orientation="vertical"
                  groupRef={workspaceVerticalGroupRef}
                  className="h-full w-full"
                  id="workspace-vertical-chat"
                >
                  <ResizablePanel
                    id="chat"
                    defaultSize="68%"
                    minSize="20%"
                    className="flex flex-col overflow-hidden min-h-0 bg-card/10"
                  >
                    {renderChatPanel()}
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel
                    id="terminal"
                    panelRef={terminalPanelRef}
                    defaultSize="32%"
                    minSize="10%"
                    collapsible
                    onResize={(size) => {
                      const isOpen = size.asPercentage > 1;
                      if (isOpen !== openState.terminal) onOpenStateChange("terminal", isOpen);
                      setIsTerminalMaximized(size.asPercentage > 80);
                    }}
                    className="flex flex-col overflow-hidden min-h-0 bg-background border-t border-border/60"
                  >
                    {renderTerminal()}
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                renderChatPanel()
              )}
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
              id="artifact"
              panelRef={codePanelRef}
              defaultSize="62%"
              minSize="20%"
              collapsible
              onResize={(size) => {
                const isOpen = size.asPercentage > 1;
                if (isOpen !== openState.artifact) onOpenStateChange("artifact", isOpen);
              }}
              className="flex flex-col overflow-hidden min-w-0 bg-background"
            >
              {renderCodePanel()}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
