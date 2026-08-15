"use client";

import { useState } from "react";
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

/**
 * The 4 user-facing panels and their default ("soft anchor") sizes.
 *
 * Explorer / chat / artifact are siblings in one flat horizontal group, so a
 * divider resizes only the two panels it divides - every other panel stays put.
 * Terminal lives in a vertical group with the artifact.
 */
export type PanelId = "explorer" | "chat" | "artifact" | "terminal";

/** Shares within their owning group. The flat row always sums to 100. */
export const PANEL_DEFAULT: Record<PanelId, number> = {
  explorer: 12.5,
  chat: 37.5,
  artifact: 50,
  terminal: 35,
};

/** Radius (in percentage points) around a default where its magnet grabs on release. */
const MAGNET_RADIUS = 4;
/** Pull applied to the remaining overshoot once inside the radius (1 = dead stop). */
const MAGNET_GRAB = 0.8;
/** A panel at or below this size is treated as closed (a collapsed panel is exactly 0). */
const CLOSED_EPSILON = 0.5;
/**
 * Smallest size a panel can be dragged to before it snaps shut. Paired with
 * `collapsible`, drag-to-close uses the library's native (smooth) behavior.
 */
const MIN_DRAG_SIZE = 12;

function easeSize(size: number, target: number) {
  return size + MAGNET_GRAB * (target - size);
}

/**
 * Build the layout for opening `panelId` to its default share.
 *
 * The space it opens into comes ONLY from panels that are above their own
 * default, shrunk proportionally to that excess - a panel never drops below its
 * default, a closed panel (0) is never touched, and no panel is widened.
 * The remainder after funding, if any, stays in the row's already-open panels.
 */
export function buildOpenLayout(
  current: Record<string, number>,
  panelId: PanelId,
  defaults: Record<PanelId, number>,
  order: PanelId[]
): Record<string, number> {
  const opening = defaults[panelId];
  // Panels that can fund the opening: open siblings currently above their default.
  const donors = order.filter((id) => id !== panelId && (current[id] ?? 0) > 0);
  const donorExcess = donors.map((id) => Math.max(0, current[id] - defaults[id]));
  const excessTotal = donorExcess.reduce((a, b) => a + b, 0);
  // Siblings give up to `opening` total, proportional to their excess over default;
  // if there isn't enough excess, they each drop to their default and the row re-normalizes.
  const cut = Math.min(opening, excessTotal);
  const out: Record<string, number> = { ...current, [panelId]: opening };
  donors.forEach((id, i) => {
    const share = excessTotal > 0 ? (cut * donorExcess[i]) / excessTotal : 0;
    out[id] = (current[id] ?? 0) - share;
  });
  return out;
}

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
  codeGroupRef: React.RefObject<GroupImperativeHandle | null>;
  onToggleExplorer: () => void;
  onToggleChat: () => void;
  onToggleArtifact: () => void;
  onToggleTerminal: () => void;
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
  codeGroupRef,
  onToggleExplorer,
  onToggleChat,
  onToggleArtifact,
  onToggleTerminal,
}: WorkspaceLayoutProps) {
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [activeTerminalTab, setActiveTerminalTab] = useState("terminal");

  const panels: Record<PanelId, React.RefObject<PanelImperativeHandle | null>> = {
    explorer: explorerPanelRef,
    chat: chatPanelRef,
    artifact: codePanelRef,
    terminal: terminalPanelRef,
  };

  const HORIZONTAL: PanelId[] = ["explorer", "chat", "artifact"];

  /** Outer group: sync toggles from sizes, then apply the release magnets. */
  const handleHorizontalLayoutChanged = () => {
    for (const id of HORIZONTAL) {
      const panel = panels[id].current;
      if (!panel) continue;
      const open = !panel.isCollapsed();
      if (open !== openState[id]) onOpenStateChange(id, open);
    }

    const current = outerGroupRef.current?.getLayout();
    if (!current) return;
    const eased: Record<string, number> = {};
    let easedTotal = 0;
    for (const id of HORIZONTAL) {
      const size = current[id];
      if (size === undefined || size <= CLOSED_EPSILON) continue;
      const offset = size - PANEL_DEFAULT[id];
      eased[id] = Math.abs(offset) <= MAGNET_RADIUS ? easeSize(size, PANEL_DEFAULT[id]) : size;
      easedTotal += eased[id];
    }
    if (easedTotal <= 0 || Math.abs(easedTotal - 100) < 0.001) return;
    const next = { ...current };
    let moved = false;
    for (const id of HORIZONTAL) {
      if (eased[id] === undefined) continue;
      next[id] = (eased[id] / easedTotal) * 100;
      if (Math.abs(next[id] - current[id]) > 0.001) moved = true;
    }
    if (moved) outerGroupRef.current?.setLayout(next);
  };

  /** Vertical group: sync the terminal toggle, then apply its release magnet. */
  const handleVerticalLayoutChanged = () => {
    const terminal = terminalPanelRef.current;
    if (terminal) {
      const open = !terminal.isCollapsed();
      if (open !== openState.terminal) onOpenStateChange("terminal", open);
    }
    const size = codeGroupRef.current?.getLayout().terminal;
    if (size === undefined || size <= CLOSED_EPSILON) return;
    const offset = size - PANEL_DEFAULT.terminal;
    if (Math.abs(offset) <= MAGNET_RADIUS) {
      terminalPanelRef.current?.resize(easeSize(size, PANEL_DEFAULT.terminal));
    }
  };

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      groupRef={outerGroupRef}
      className="h-full w-full"
      onLayoutChanged={handleHorizontalLayoutChanged}
    >
      <ResizablePanel
        defaultSize={PANEL_DEFAULT.explorer}
        collapsible
        minSize={MIN_DRAG_SIZE}
        id="explorer"
        panelRef={explorerPanelRef}
        className="flex flex-col border-r border-border/60 bg-card/30 overflow-hidden min-w-0"
      >
        <ExplorerPanel
          activeTab={activeActivityTab}
          isCollapsed={!openState.explorer}
          onToggleCollapse={onToggleExplorer}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel
        defaultSize={PANEL_DEFAULT.chat}
        collapsible
        minSize={MIN_DRAG_SIZE}
        id="chat"
        panelRef={chatPanelRef}
        className={cn(
          "flex flex-col overflow-hidden bg-card/10 min-w-0",
          openState.chat && "border-r border-border/60"
        )}
      >
        <ChatPanel />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel
        defaultSize={PANEL_DEFAULT.artifact}
        collapsible
        minSize={MIN_DRAG_SIZE}
        id="artifact"
        panelRef={codePanelRef}
        className="flex flex-col overflow-hidden min-w-0"
      >
        {/* Terminal docks under the artifact in a vertical group. */}
        <ResizablePanelGroup
          orientation="vertical"
          groupRef={codeGroupRef}
          className="h-full w-full"
          onLayoutChanged={handleVerticalLayoutChanged}
        >
          <ResizablePanel
            defaultSize={100 - PANEL_DEFAULT.terminal}
            minSize={0}
            id="code"
            className="flex flex-col overflow-hidden min-h-0 bg-background"
          >
            <CodePanel
              files={files}
              currentFile={currentFile}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
              openTabs={openTabs}
              setOpenTabs={setOpenTabs}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={PANEL_DEFAULT.terminal}
            collapsible
            minSize={MIN_DRAG_SIZE}
            id="terminal"
            panelRef={terminalPanelRef}
            onResize={(size) => setIsTerminalMaximized(size.asPercentage > 90)}
            className="flex flex-col overflow-hidden min-h-0 bg-background border-t border-border/60"
          >
            <TerminalPanel
              activeTab={activeTerminalTab}
              onTabChange={setActiveTerminalTab}
              isMaximized={isTerminalMaximized}
              onToggleMaximize={() => {
                codeGroupRef.current?.setLayout({
                  code: isTerminalMaximized ? 100 - PANEL_DEFAULT.terminal : 20,
                  terminal: isTerminalMaximized ? PANEL_DEFAULT.terminal : 80,
                });
              }}
              onToggleCollapse={onToggleTerminal}
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
